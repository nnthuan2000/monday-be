import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { ITypeDoc } from './type';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';

export interface IColumn {
  name: string;
  position: number;
  belongType: Types.ObjectId;
  defaultValues: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewColumn {
  boardId: string;
  typeId: string;
  position: number;
  userId: Types.ObjectId;
  session: ClientSession;
}

export interface ICreateNewColumns {
  boardId: string | Types.ObjectId;
  userId: Types.ObjectId;
  session: ClientSession;
}

export interface ICreateNewColumnResult {
  createdNewColumn: NonNullable<IColumnDoc>;
  defaultValues: NonNullable<IDefaultValueDoc>[];
  tasksColumnsIds: Types.ObjectId[];
}

export interface IDeleteColumn {
  boardId?: string;
  columnId: Types.ObjectId | string;
  session: ClientSession;
}

// For instance methods

export type IColumnDoc = Doc<IColumn, IColumnMethods>;
export type IColumnDocObj = DocObj<IColumn>;

export type IColumnDocWithType = NonNullable<IColumnDoc> & {
  belongType: ITypeDoc;
};

export interface IColumnMethods {}

// For statics
export interface ColumnModel extends Model<IColumn, {}, IColumnMethods> {
  createNewColumn({
    boardId,
    typeId,
    userId,
    position,
    session,
  }: ICreateNewColumn): Promise<ICreateNewColumnResult>;

  createNewColumns({
    boardId,
    userId,
    session,
  }: ICreateNewColumns): Promise<NonNullable<IColumnDoc>[]>;
  deleteColumn({ boardId, columnId, session }: IDeleteColumn): Promise<null>;
}
