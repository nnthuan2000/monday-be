import { Request } from 'express';
import { Fn } from '../../root/utils/catchAsync';
import { IFullController } from '../../root/app.interfaces';

export default interface IWorkspaceController<T extends Request> extends IFullController<T> {
  searchWorkspace: Fn<T>;
}
