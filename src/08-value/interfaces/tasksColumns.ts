import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IBoardDoc } from '../../04-board/interfaces/board';
import { IColumnDoc } from '../../05-column/interfaces/column';
import { IDefaultValueDoc } from './defaultValue';

export interface ITasksColumns {
  value: string | null;
  valueId: Types.ObjectId | null;
  typeOfValue: string;
  belongColumn: Types.ObjectId;
  belongTask: Types.ObjectId;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewTasksColumns {
  data: ITasksColumns;
  session: ClientSession;
}

export interface ICreateTasksColumnsByColumn {
  boardDoc: NonNullable<IBoardDoc>;
  columnDoc: NonNullable<IColumnDoc>;
  defaultValues: NonNullable<IDefaultValueDoc>[];
  position: number;
  session: ClientSession;
}

export interface IDeleteTasksColumnsByColumn {
  tasksColumnsDoc: NonNullable<ITasksColumnsDoc>;
  session: ClientSession;
}

// For instance methods

export type ITasksColumnsDoc = Doc<ITasksColumns, ITasksColumnsMethods>;
export type ITasksColumnsDocObj = DocObj<ITasksColumns>;

export interface ITasksColumnsMethods {}

// For statics
export interface TasksColumnsModel extends Model<ITasksColumns, {}, ITasksColumnsMethods> {
  createNewTasksColumns({
    data,
    session,
  }: ICreateNewTasksColumns): Promise<NonNullable<ITasksColumnsDoc>>;

  createTasksColumnsByColumn({
    boardDoc,
    columnDoc,
    defaultValues,
    position,
    session,
  }: ICreateTasksColumnsByColumn): Promise<Types.ObjectId[]>;
  deleteTasksColumnsByColumn({
    tasksColumnsDoc,
    session,
  }: IDeleteTasksColumnsByColumn): Promise<null>;
}
