import { Request } from 'express';
import { Fn } from '../../root/utils/catchAsync';
import { IControllerWithoutGet } from '../../root/app.interfaces';

export interface IColumnController<T extends Request> extends IControllerWithoutGet<T> {
  getAllTypes: Fn<T>;
}
