import { Request } from 'express';
import { Fn } from '../../root/utils/catchAsync';
import { IFullController } from '../../root/app.interfaces';

export interface IColumnController<T extends Request> extends IFullController<T> {
  getAllTypes: Fn<T>;
}
