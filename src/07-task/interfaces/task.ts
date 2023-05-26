import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IColumnDoc, IColumnWithDefaultValues } from '../../05-column/interfaces/column';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';

export interface ITask {
  name: string;
  position: number;
  description?: string;
  values: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewTask {
  groupId: string;
  data: ITask;
  columns: IColumnWithDefaultValues[];
  session: ClientSession;
}

export interface ICreateNewTasks {
  columns: NonNullable<IColumnDoc>[];
  selectedDefaultValues: IDefaultValueDoc[];
  session: ClientSession;
}

export interface IUpdateAllPositionsInValue {
  changedPositions: number[];
  desiredPositions: number[];
  taskId: Types.ObjectId;
  session: ClientSession;
}

export interface IDeleteTask {
  groupId?: string;
  taskId: Types.ObjectId | string;
  session: ClientSession;
}

export interface IDeleteAllTasks {
  groupId: string;
  session: ClientSession;
}

// For instance methods

export type ITaskDoc = Doc<ITask, ITaskMethods>;
export type ITaskDocObj = DocObj<ITask>;

export interface ITaskMethods {}

// For statics

export interface TaskModel extends Model<ITask, {}, ITaskMethods> {
  createNewTask({
    groupId,
    data,
    columns,
    session,
  }: ICreateNewTask): Promise<NonNullable<ITaskDoc>>;
  createNewTasks({
    columns,
    selectedDefaultValues,
    session,
  }: ICreateNewTasks): Promise<NonNullable<ITaskDoc>[]>;
  updateAllPositionsInValue({
    changedPositions,
    desiredPositions,
    taskId,
    session,
  }: IUpdateAllPositionsInValue): Promise<null>;
  deleteTask({ groupId, taskId, session }: IDeleteTask): Promise<null>;

  deleteAllTasks({ groupId, session }: IDeleteAllTasks): Promise<null>;
}
