import { Request } from 'express';
import { Fn } from '../../root/utils/catchAsync';
import { IFullController } from '../../root/app.interfaces';

export interface IBoardController<T extends Request> extends IFullController<T> {
  searchBoards: Fn<T>;
}
