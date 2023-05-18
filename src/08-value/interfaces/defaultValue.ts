import { Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { MultipleValueTypes } from '../../05-column/constant';

export interface IDefaultValue {
  value: string;
  color: string;
  canEditColor: boolean;
  belongType: Types.ObjectId;
  belongBoard: Types.ObjectId;
  createdBy: Types.ObjectId;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface IInitDefaultValues {
  type: MultipleValueTypes;
  icon: string;
  color: string;
}

// For instance methods

export type IDefaultValueDoc = Doc<IDefaultValue, IDefaultValueMethods>;
export type IDefaultValueDocObj = DocObj<IDefaultValue>;

export interface IDefaultValueMethods {}

// For statics
export interface DefaultValueModel extends Model<IDefaultValue, {}, IDefaultValueMethods> {
  initDefaultValues({ type, icon, color }: IInitDefaultValues): Promise<null>;
}
