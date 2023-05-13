import { Model, Schema } from 'mongoose';
import { Doc, DocObj, SelectOptions } from '../../root/app.interfaces';

export interface IUser {
  email: string;
  password: string;
  userProfile: Schema.Types.Mixed;
}

export interface Payload {
  userId: string;
  email: string;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface IFindByEmailParams {
  email: string;
  selectOptions?: SelectOptions<IUser>;
}

interface IGenerateTokensResult {
  accessToken: string;
  refreshToken: string;
  accessTokenLifeTime: number;
  refreshTokenLifeTime: number;
}

// For instance methods
export interface IUserMethods {
  isMatchPassword(passwordInputed: string): Promise<boolean>;
  generateTokens(): IGenerateTokensResult;
}

export type IUserDoc = Doc<IUser, IUserMethods>;
export type IUserDocObj = DocObj<IUser>;

// For statics
export interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail({ email, selectOptions }: IFindByEmailParams): Promise<IUserDoc>;
}
