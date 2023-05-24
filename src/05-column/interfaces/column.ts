import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { ITypeDoc } from './type';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import { IBoardDoc } from '../../04-board/interfaces/board';

export interface IColumn {
  name: string;
  position: number;
  belongType: Types.ObjectId;
  defaultValues: Types.ObjectId[];
}

export interface IColumnWithId {
  _id?: string;
  name: string;
  position: number;
  belongType: string;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface IFindByColumnAndUpdatePosition {
  columnId: string | Types.ObjectId;
  position: number;
  session: ClientSession;
}

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

export interface ICreateNewColumnsResult {
  createdNewColumns: NonNullable<IColumnDoc>[];
  selectedDefaultValues: IDefaultValueDoc[];
}

export interface ICreateNewColumnResult {
  createdNewColumn: NonNullable<IColumnDoc>;
  defaultValues: NonNullable<IDefaultValueDoc>[];
  tasksColumnsIds: Types.ObjectId[];
}

export interface IUpdateAllColumns {
  columns: NonNullable<IColumnDoc>[];
  session: ClientSession;
}

export interface IDeleteColumn {
  boardDoc: NonNullable<IBoardDoc>;
  columnId: Types.ObjectId | string;
  session: ClientSession;
}

// For instance methods

export type IColumnDoc = Doc<IColumn, IColumnMethods>;
export type IColumnDocObj = DocObj<IColumn>;

export type IColumnDocWithType = NonNullable<IColumnDoc> & {
  belongType: ITypeDoc;
};

export type IColumnWithDefaultValues = NonNullable<IColumnDoc> & {
  defaultValues: IDefaultValueDoc[];
};

export interface IColumnMethods {}

// For statics
export interface ColumnModel extends Model<IColumn, {}, IColumnMethods> {
  findByIdAndUpdatePosition({
    columnId,
    position,
    session,
  }: IFindByColumnAndUpdatePosition): Promise<NonNullable<IColumnDoc>>;

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
  }: ICreateNewColumns): Promise<ICreateNewColumnsResult>;

  updateAllColumnsForDelete({ columns, session }: IUpdateAllColumns): Promise<void>;

  updateAllColumns({ columns, session }: IUpdateAllColumns): Promise<NonNullable<IColumnDoc>[]>;

  deleteColumn({ boardDoc, columnId, session }: IDeleteColumn): Promise<null>;
}
