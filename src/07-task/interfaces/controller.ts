import { Request } from 'express';
import { IFullController } from '../../root/app.interfaces';
import { Fn } from '../../root/utils/catchAsync';

export interface ITaskController<T extends Request> extends IFullController<T> {
  updateAllTasks: Fn<T>;
}
