import { Request } from 'express';
import { Fn } from '../../root/utils/catchAsync';

export interface IAccessController<T extends Request> {
  signIn: Fn<T>;
  signUp: Fn<T>;
  sendCode: Fn<T>;
  verifyCode: Fn<T>;
  getMe: Fn<T>;
  logout: Fn<T>;
}
