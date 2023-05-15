import { Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';

export interface IValue {
  value: string | Types.ObjectId;
  typeOfValue: string;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

// For instance methods

export type IValueDoc = Doc<IValue, IValueMethods>;
export type IValueDocObj = DocObj<IValue>;

export interface IValueMethods {}

// For statics
export interface ValueModel extends Model<IValue, {}, IValueMethods> {}
