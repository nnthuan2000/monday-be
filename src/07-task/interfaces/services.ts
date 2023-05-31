import { ITask, ITaskDoc, ITaskForCreate } from './task';

export interface IGetTaskParams {
  taskId: string;
}

export interface ICreateTaskParams {
  boardId: string;
  groupId: string;
  data: ITaskForCreate;
}

export interface IUpdateAllTasksParams {
  groupId: string;
  tasks: NonNullable<ITaskDoc>[];
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
