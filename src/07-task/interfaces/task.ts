import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IColumnDoc } from '../../05-column/interfaces/column';

export interface ITask {
  name: string;
  position: number;
  description?: string;
  values: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewTasks {
  groupId?: string;
  data?: ITask;
  columns?: IColumnDoc[];
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
  createNewTasks({
    groupId,
    columns,
    data,
    session,
  }: ICreateNewTasks): Promise<NonNullable<ITaskDoc>[]>;
  deleteTask({ groupId, taskId, session }: IDeleteTask): Promise<null>;
}
