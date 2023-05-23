import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { MultipleValueTypes } from '../../05-column/constant';
import { ITypeDoc } from '../../05-column/interfaces/type';

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
}

export interface ICreateNewDefaultValuesByColumn {
  boardId: Types.ObjectId;
  typeDoc: NonNullable<ITypeDoc>;
  createdBy: Types.ObjectId;
  session: ClientSession;
}

// For instance methods

export type IDefaultValueDoc = Doc<IDefaultValue, IDefaultValueMethods>;
export type IDefaultValueDocObj = DocObj<IDefaultValue>;

export interface IDefaultValueMethods {}

// For statics
export interface DefaultValueModel extends Model<IDefaultValue, {}, IDefaultValueMethods> {
  createNewDefaultValuesByColumn({
    boardId,
    createdBy,
    typeDoc,
    session,
  }: ICreateNewDefaultValuesByColumn): Promise<NonNullable<IDefaultValueDoc>[]>;
  initDefaultValues({ type }: IInitDefaultValues): Promise<null>;
}
