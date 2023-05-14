import { ITask } from './task';

export interface IGetTaskParams {
  taskId: string;
}

export interface ICreateTaskParams {
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
