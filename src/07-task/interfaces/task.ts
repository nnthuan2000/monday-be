import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IColumnDoc } from '../../05-column/interfaces/column';

export interface ITask {
  name: string;
  description?: string;
  position: number;
  values: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewTasks {
  groupId?: Types.ObjectId | string;
  columns: IColumnDoc[];
  session: ClientSession;
}

export interface IDeleteTask {
  groupId: Types.ObjectId | string;
  taskId: Types.ObjectId | string;
  session: ClientSession;
}

// For instance methods

export type ITaskDoc = Doc<ITask, ITaskMethods>;
export type ITaskDocObj = DocObj<ITask>;

export interface ITaskMethods {}

// For statics
export interface TaskModel extends Model<ITask, {}, ITaskMethods> {
  createNewTasks({ groupId, columns, session }: ICreateNewTasks): Promise<NonNullable<ITaskDoc>[]>;
  deleteTask({ groupId, taskId, session }: IDeleteTask): Promise<null>;
}
