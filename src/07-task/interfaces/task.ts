import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IColumnDoc } from '../../05-column/interfaces/column';
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

export interface ICreateNewTasks {
  groupId?: string;
  data?: ITask;
  columns: NonNullable<IColumnDoc>[];
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
export interface ICreateNewTasksResult {
  createdNewTasks: NonNullable<ITaskDoc>[];
  defaultValues?: IDefaultValueDoc[];
}

export interface TaskModel extends Model<ITask, {}, ITaskMethods> {
  createNewTasks({
    groupId,
    data,
    columns,
    session,
  }: ICreateNewTasks): Promise<ICreateNewTasksResult>;
  deleteTask({ groupId, taskId, session }: IDeleteTask): Promise<null>;
}
