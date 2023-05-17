import { IColumnDoc } from '../05-column/interfaces/column';
import Board from '../models/board';
import Task from '../models/task';
import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateTaskParams,
  IDeleteTaskParams,
  IGetTaskParams,
  IUpdateTaskParams,
} from './interfaces/services';
import { ITaskDoc } from './interfaces/task';

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
      const foundBoard = await Board.findById(boardId)
        .populate({
          path: 'columns',
          select: '_id name belongType position',
          options: {
            sort: { position: 1 },
          },
        })
        .lean();

      if (!foundBoard) throw new BadRequestError('Board is not found');

      const createdNewTask = await Task.createNewTasks({
        groupId,
        data,
        columns: foundBoard.columns as NonNullable<IColumnDoc>[],
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
}
