import { Request } from 'express';
import { IControllerWithoutGet } from '../../root/app.interfaces';
import { Fn } from '../../root/utils/catchAsync';

export interface IGroupController<T extends Request> extends IControllerWithoutGet<T> {
  updateAllGroups: Fn<T>;
}
