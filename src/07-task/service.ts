import Task from '../models/task';
import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateTaskParams,
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
      let createdNewTask: ITaskDoc = null;
      const updatingPositionTasks: Promise<NonNullable<ITaskDoc>>[] = [];
      for (const [index, task] of tasks.entries()) {
        if (task._id) {
          const updatingTask = Task.findByIdAndUpdatePosition({
            taskId: task._id,
            position: index,
            session,
          });

          updatingPositionTasks.push(updatingTask);
        } else {
          createdNewTask = await Task.createNewTask({
            boardId,
            groupId,
            data: { ...task },
            session,
          });
        }
      }

      await Promise.all(updatingPositionTasks);
      if (createdNewTask) throw new BadRequestError('Missing some fields when create a new task');

      return createdNewTask;
    });
  }

  static async updateTask({ taskId, updationData }: IUpdateTaskParams) {
    const updatedTask = await Task.findByIdAndUpdate(taskId, updationData, { new: true }).lean();
    if (!updatedTask) throw new BadRequestError('Task is not found');
    return updatedTask;
  }

  static async updateAllTasks({ tasks }: IUpdateAllTasksParams) {
    return await performTransaction(async (session) => {
      return await Task.updateAllPositionTasks({ tasks, session });
    });
  }

  static async deleteTask({ groupId, taskId, tasks }: IDeleteTaskParams) {
    return await performTransaction(async (session) => {
      await Task.deleteTask({ groupId, taskId, session });
      await Task.updateAllPositionTasks({ tasks, session });
    });
  }
}
