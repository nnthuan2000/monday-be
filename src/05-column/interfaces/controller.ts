import { Request } from 'express';
import { Fn } from '../../root/utils/catchAsync';
import { IControllerWithoutGet } from '../../root/app.interfaces';
import { IColumnDoc } from './column';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import { ITasksColumnsDoc } from '../../08-value/interfaces/tasksColumns';

export interface IColumnController<T extends Request> extends IControllerWithoutGet<T> {
  getAllTypes: Fn<T>;
  updateAllColumns: Fn<T>;
}

export interface ICreateColumnResult {
  createdNewColumn: NonNullable<IColumnDoc>;
  defaultValues: NonNullable<IDefaultValueDoc>[];
  tasksColumns: NonNullable<ITasksColumnsDoc>[];
}
