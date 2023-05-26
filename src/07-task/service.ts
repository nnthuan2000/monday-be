import Board from '../models/board';
import Task from '../models/task';
import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateTaskParams,
  IDeleteAllTasksParams,
  IDeleteTaskParams,
  IGetTaskParams,
  IUpdateTaskParams,
} from './interfaces/services';
import { ITaskDoc } from './interfaces/task';
import { IColumnWithDefaultValues } from '../05-column/interfaces/column';

export default class TaskService {
  static async getTask({ taskId }: IGetTaskParams) {
    const foundTask = await Task.findById(taskId).lean();
    if (!foundTask) throw new BadRequestError('Task is not found');
    return foundTask;
  }

  static async createTask({
    boardId,
    groupId,
    data,
  }: ICreateTaskParams): Promise<NonNullable<ITaskDoc>> {
    return await performTransaction(async (session) => {
      const foundBoard = await Board.findById(boardId).populate({
        path: 'columns',
        select: '_id name defaultValues',
        populate: {
          path: 'defaultValues',
          select: '_id value color canEditColor',
          match: {
            canEditColor: false,
          },
          transform: (doc, id) => (doc === null ? null : doc),
        },
      });

      console.log({ foundBoard });

      if (!foundBoard) throw new BadRequestError('Board is not found');

      const createdNewTask = await Task.createNewTask({
        groupId,
        data,
        columns: foundBoard.columns as IColumnWithDefaultValues[],
        session,
      });

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

  static async deleteAllTasks({ groupId }: IDeleteAllTasksParams) {
    return await performTransaction(async (session) => {
      await Task.deleteAllTasks({ groupId, session });
    });
  }
}
