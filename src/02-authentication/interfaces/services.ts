import { Types } from 'mongoose';
import { IUserDoc } from '../../01-user/interfaces/user';

export interface ISignInParams {
  email: string;
  password: string;
}

export interface IVerfiyCode extends ISignInParams {
  code: string;
}

export interface ISignUpParams extends ISignInParams {
  name: string;
}

export interface IGetMeParams {
  id: Types.ObjectId;
}

export interface ISendResToClient<T extends IUserDoc> {
  Doc: NonNullable<T>;
  fields: string[];
}
