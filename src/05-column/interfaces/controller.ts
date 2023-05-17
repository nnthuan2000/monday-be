import { Request } from 'express';
import { Fn } from '../../root/utils/catchAsync';
import { IControllerWithoutGet } from '../../root/app.interfaces';
import { IColumnDoc } from './column';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import { Types } from 'mongoose';

export interface IColumnController<T extends Request> extends IControllerWithoutGet<T> {
  getAllTypes: Fn<T>;
}

export interface ICreateColumnResult {
  createdNewColumn: NonNullable<IColumnDoc>;
  defaultValue: IDefaultValueDoc;
  tasksColumnsIds: Types.ObjectId[];
}
