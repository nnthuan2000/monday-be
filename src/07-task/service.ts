import Task from '../models/task';
import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateTaskParams,
  IDeleteTaskParams,
  IGetTaskParams,
  IUpdateTaskParams,
} from './interfaces/services';

export default class TaskService {
  static async getTask({ taskId }: IGetTaskParams) {
    const foundTask = await Task.findById(taskId).lean();
    if (!foundTask) throw new BadRequestError('Task is not found');
    return foundTask;
  }

  static async createTask({ groupId, data }: ICreateTaskParams) {
    return await performTransaction(async (session) => {
      const [createdNewTask] = await Task.createNewTasks({ groupId, data, session });
      return createdNewTask;
    });
  }

  static async updateTask({ taskId, updationData }: IUpdateTaskParams) {
    const updatedTask = await Task.findByIdAndUpdate(taskId, updationData, { new: true }).lean();
    if (!updatedTask) throw new BadRequestError('Task is not found');
    return updatedTask;
  }

  static async deleteTask({ groupId, taskId }: IDeleteTaskParams) {
    return await performTransaction(async (session) => {
      await Task.deleteTask({ groupId, taskId, session });
    });
  }
}
