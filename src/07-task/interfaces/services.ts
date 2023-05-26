import { ITask } from './task';

export interface IGetTaskParams {
  taskId: string;
}

export interface ICreateTaskParams {
  boardId: string;
  groupId: string;
  data: ITask;
}

export interface IUpdateTaskParams {
  taskId: string;
  updationData: Partial<ITask>;
}

export interface IDeleteTaskParams {
  groupId: string;
  taskId: string;
}

export interface IDeleteAllTasksParams {
  groupId: string;
}
