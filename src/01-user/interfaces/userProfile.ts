import { Model } from 'mongoose';
import { Doc, DocObj, SelectOptions } from '../../root/app.interfaces';

export interface IUserProfile {
  name: string;
  title?: string;
  phone?: string;
  birthday?: Date;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

interface IFindByEmailParams {
  email: string;
  selectOptions: SelectOptions<IUserProfile>;
}

// For instance methods
export interface IUserProfileMethods {}

export type IUserProfileDoc = Doc<IUserProfile, IUserProfileMethods>;
export type IUserProfileDocObj = DocObj<IUserProfile>;

// For statics
export interface UserProfileModel extends Model<IUserProfile, {}, IUserProfileMethods> {
  findByEmail({ email, selectOptions }: IFindByEmailParams): Promise<IUserProfileDoc>;
}
