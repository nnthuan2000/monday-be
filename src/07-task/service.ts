import validator from 'validator';
import Group from '../models/group';
import Task from '../models/task';
import { BadRequestError, NotFoundError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateTaskParams,
  IDeleteAllTasksInGroup,
  IDeleteTasks,
  IGetTaskParams,
  IUpdateAllTasksParams,
  IUpdateTaskParams,
} from './interfaces/services';
import { ITaskDoc } from './interfaces/task';

export default class TaskService {
  static async getTask({ taskId }: IGetTaskParams) {
    if (!validator.isMongoId(taskId)) throw new BadRequestError(`Task Id: ${taskId} is invalid`);

    const foundTask = await Task.findById(taskId).lean();
    if (!foundTask) throw new NotFoundError('Task is not found');
    return foundTask;
  }

  static async createTask({ boardId, groupId, data }: ICreateTaskParams) {
    if (!validator.isMongoId(boardId)) throw new BadRequestError(`Board Id: ${boardId} is invalid`);
    if (!validator.isMongoId(groupId)) throw new BadRequestError(`Group Id: ${groupId} is invalid`);
    if (!(data.hasOwnProperty('name') && data.hasOwnProperty('position')))
      throw new BadRequestError('Missing some fields to create a new task');

    const insertPosition = data.position;
    return await performTransaction(async (session) => {
      const foundGroupWithTasks = await Group.findById(groupId, {}, { session }).populate({
        path: 'tasks',
        select: '_id position',
        options: {
          sort: { position: 1 },
        },
      });

      if (!foundGroupWithTasks) throw new NotFoundError('Group is not found');

      if (insertPosition > foundGroupWithTasks.tasks.length)
        throw new BadRequestError(`Invalid position ${insertPosition} to create a new task`);

      let updatingTaskPromises: any = [];
      const slicedTasks = foundGroupWithTasks.tasks.slice(insertPosition);
      updatingTaskPromises = slicedTasks.map((task, index) => {
        return (task as NonNullable<ITaskDoc>).updateOne(
          {
            $set: {
              position: insertPosition + index + 1,
            },
          },
          { new: true, session }
        );
      });

      const creatingNewTaskPromise = Task.createNewTask({
        boardId,
        groupDoc: foundGroupWithTasks,
        data,
        session,
      });

      updatingTaskPromises.unshift(creatingNewTaskPromise);

      const [createdNewTask] = await Promise.all(updatingTaskPromises);

      return createdNewTask;
    });
  }

  static async updateTask({ taskId, updationData }: IUpdateTaskParams) {
    if (!validator.isMongoId(taskId)) throw new BadRequestError(`Task Id: ${taskId} is invalid`);

    if (updationData.position) throw new BadRequestError(`Can't modify position of task`);
    const updatedTask = await Task.findByIdAndUpdate(taskId, updationData, { new: true }).lean();
    if (!updatedTask) throw new NotFoundError('Task is not found');
    return updatedTask;
  }

  static async updateAllTasks({ groupId, tasks }: IUpdateAllTasksParams) {
    if (!validator.isMongoId(groupId)) throw new BadRequestError(`Group Id: ${groupId} is invalid`);

    const foundGroup = await Group.findById(groupId);
    if (!foundGroup) throw new NotFoundError('Group is not found');

    if (foundGroup.tasks.length !== tasks.length)
      throw new BadRequestError('Please send all tasks in a board to update all position of tasks');

    const totalNumOfTasks = tasks.length;
    const totalDesiredPosition = (totalNumOfTasks * (0 + totalNumOfTasks - 1)) / 2;
    const totalPosition = tasks.reduce((currTotal, task) => currTotal + task.position, 0);

    if (totalDesiredPosition !== totalPosition)
      throw new BadRequestError('Something wrong when transmitted position of tasks');

    return await performTransaction(async (session) => {
      return await Task.updateAllPositionTasks({ tasks, session });
    });
  }

  static async deleteTasks({ groupId, taskIds }: IDeleteTasks) {
    if (!validator.isMongoId(groupId)) throw new BadRequestError(`Group Id: ${groupId} is invalid`);

    const foundGroup = await Group.findById(groupId);
    if (!foundGroup) throw new NotFoundError('Group is not found');

    return await performTransaction(async (session) => {
      const deletingTaskPromises = taskIds.map((taskId) =>
        Task.deleteTask({ groupDoc: foundGroup, taskId, session })
      );
      await Promise.all(deletingTaskPromises);
    });
  }

  static async deleteAllTasksInGroup({ groupId }: IDeleteAllTasksInGroup) {
    if (!validator.isMongoId(groupId)) throw new BadRequestError(`Group Id: ${groupId} is invalid`);

    return await performTransaction(async (session) => {
      await Task.deleteAllTasks({ groupId, session });
    });
  }
}
