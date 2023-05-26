import { Request } from 'express';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import { ITaskDoc } from './task';
import { IFullController } from '../../root/app.interfaces';
import { Fn } from '../../root/utils/catchAsync';

export interface ITaskController<T extends Request> extends IFullController<T> {
  deleteAllTasks: Fn<T>;
}

export interface ICreateTaskResult {
  createdNewTask: NonNullable<ITaskDoc>;
  defaultValues: IDefaultValueDoc[];
}
