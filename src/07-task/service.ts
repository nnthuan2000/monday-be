import Group from '../models/group';
import Task from '../models/task';
import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateTaskParams,
  IDeleteAllTasksParams,
  IDeleteTaskParams,
  IGetTaskParams,
  IUpdateAllTasksParams,
  IUpdateTaskParams,
} from './interfaces/services';
import { ITaskDoc } from './interfaces/task';

export default class TaskService {
  static async getTask({ taskId }: IGetTaskParams) {
    const foundTask = await Task.findById(taskId).lean();
    if (!foundTask) throw new BadRequestError('Task is not found');
    return foundTask;
  }

  static async createTask({ boardId, groupId, tasks }: ICreateTaskParams) {
    return await performTransaction(async (session) => {
      let creatingNewTaskPromise: Promise<NonNullable<ITaskDoc>> | null = null;
      const workingPositionTasks = tasks.map((task, index) => {
        if (task._id) {
          return Task.findByIdAndUpdatePosition({
            taskId: task._id,
            position: index,
            session,
          });
        } else {
          creatingNewTaskPromise = Task.createNewTask({
            boardId,
            groupId,
            data: { ...task, position: index },
            session,
          });
        }
      });

      if (!creatingNewTaskPromise)
        throw new BadRequestError('Missing some fields when create a new task');
      workingPositionTasks.unshift(creatingNewTaskPromise);
      const [createdNewTask] = await Promise.all(workingPositionTasks);

      return createdNewTask;
    });
  }

  static async updateTask({ taskId, updationData }: IUpdateTaskParams) {
    const updatedTask = await Task.findByIdAndUpdate(taskId, updationData, { new: true }).lean();
    if (!updatedTask) throw new BadRequestError('Task is not found');
    return updatedTask;
  }

  static async updateAllTasks({ groupId, tasks }: IUpdateAllTasksParams) {
    const foundGroup = await Group.findById(groupId);
    if (!foundGroup) throw new BadRequestError('Group is not found');

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

  static async deleteTask({ groupId, taskId, tasks }: IDeleteTaskParams) {
    const foundGroup = await Group.findById(groupId);
    if (!foundGroup) throw new BadRequestError('Group is not found');

    if (foundGroup.tasks.length - 1 !== tasks.length)
      throw new BadRequestError('Please send all the tasks when delete a task in group');

    return await performTransaction(async (session) => {
      await Task.deleteTask({ groupDoc: foundGroup, taskId, session });
      await Task.updateAllPositionTasks({ tasks, session });
    });
  }

  static async deleteAllTasks({ groupId }: IDeleteAllTasksParams) {
    return await performTransaction(async (session) => {
      await Task.deleteAllTasks({ groupId, session });
    });
  }
}
