import { Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IBoardDoc } from '../../04-board/interfaces/board';
import { IColumnDoc } from '../../05-column/interfaces/column';
import { IDefaultValueDoc } from './defaultValue';

export interface ITasksColumns {
  value: string;
  valueId: Types.ObjectId;
  typeOfValue: string;
  belongColumn: Types.ObjectId;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateTasksColumnsByColumn {
  boardDoc: NonNullable<IBoardDoc>;
  columnDoc: NonNullable<IColumnDoc>;
  defaultValue: IDefaultValueDoc;
}

// For instance methods

export type ITasksColumnsDoc = Doc<ITasksColumns, ITasksColumnsMethods>;
export type ITasksColumnsDocObj = DocObj<ITasksColumns>;

export interface ITasksColumnsMethods {}

// For statics
export interface TasksColumnsModel extends Model<ITasksColumns, {}, ITasksColumnsMethods> {
  createTasksColumnsByColumn({
    boardDoc,
    columnDoc,
    defaultValue,
  }: ICreateTasksColumnsByColumn): Promise<Types.ObjectId[]>;
}
