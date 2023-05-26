import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IColumnDoc } from '../../05-column/interfaces/column';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import { IGroupDoc } from '../../06-group/interfaces/group';

export interface ITask {
  name: string;
  position: number;
  description?: string;
  values: Types.ObjectId[];
}

export interface ITaskWithId extends ITask {
  _id?: string;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface IFindByIdAndUpdatePosition {
  taskId: string | Types.ObjectId;
  position: number;
  session: ClientSession;
}

export interface ICreateNewTask {
  boardId: string;
  groupId: string;
  data: ITask;
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

export interface IUpdateAllPositionTasks {
  tasks: NonNullable<ITaskDoc>[];
  session: ClientSession;
}

export interface IDeleteTask {
  groupDoc?: NonNullable<IGroupDoc>;
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
  findByIdAndUpdatePosition({
    taskId,
    position,
    session,
  }: IFindByIdAndUpdatePosition): Promise<NonNullable<ITaskDoc>>;

  createNewTask({
    boardId,
    groupId,
    data,
    session,
  }: ICreateNewTask): Promise<NonNullable<ITaskDoc>>;
  createNewTasks({
    columns,
    selectedDefaultValues,
    session,
  }: ICreateNewTasks): Promise<NonNullable<ITaskDoc>[]>;

  updateAllPositionTasks({
    tasks,
    session,
  }: IUpdateAllPositionTasks): Promise<NonNullable<ITaskDoc>[]>;

  updateAllPositionsInValue({
    changedPositions,
    desiredPositions,
    taskId,
    session,
  }: IUpdateAllPositionsInValue): Promise<null>;
  deleteTask({ groupDoc, taskId, session }: IDeleteTask): Promise<null>;

  deleteAllTasks({ groupId, session }: IDeleteAllTasks): Promise<null>;
}
