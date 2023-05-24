import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IColumnDoc } from '../../05-column/interfaces/column';

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
  session: ClientSession;
}

export interface IUpdateAllPositionTasks {
  tasks: NonNullable<ITaskDoc>[];
  session: ClientSession;
}

export interface IDeleteTask {
  groupId?: string;
  taskId: Types.ObjectId | string;
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

  createNewTasks({ columns, session }: ICreateNewTasks): Promise<NonNullable<ITaskDoc>[]>;

  updateAllPositionTasks({
    tasks,
    session,
  }: IUpdateAllPositionTasks): Promise<NonNullable<ITaskDoc>[]>;

  deleteTask({ groupId, taskId, session }: IDeleteTask): Promise<null>;
}
