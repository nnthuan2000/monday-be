import { ITask, ITaskDoc, ITaskWithId } from './task';

export interface IGetTaskParams {
  taskId: string;
}

export interface ICreateTaskParams {
  boardId: string;
  groupId: string;
  tasks: ITaskWithId[];
}

export interface IUpdateAllTasksParams {
  tasks: NonNullable<ITaskDoc>[];
}

export interface IUpdateTaskParams {
  taskId: string;
  updationData: Partial<ITask>;
}

export interface IDeleteTaskParams {
  groupId: string;
  tasks: NonNullable<ITaskDoc>[];
  taskId: string;
}
