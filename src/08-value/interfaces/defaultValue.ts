import { Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';

export interface IDefaultValue {
  value: string;
  color: string;
  belongType: Types.ObjectId;
  belongBoard: Types.ObjectId;
  createdBy: Types.ObjectId;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

// For instance methods

export type IDefaultValueDoc = Doc<IDefaultValue, IDefaultValueMethods>;
export type IDefaultValueDocObj = DocObj<IDefaultValue>;

export interface IDefaultValueMethods {}

// For statics
export interface DefaultValueModel extends Model<IDefaultValue, {}, IDefaultValueMethods> {}
