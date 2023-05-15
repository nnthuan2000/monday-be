import { Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';

export interface ITasksColumns {
  value: Types.ObjectId;
  belongColumn: Types.ObjectId;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

// For instance methods

export type ITasksColumnsDoc = Doc<ITasksColumns, ITasksColumnsMethods>;
export type ITasksColumnsDocObj = DocObj<ITasksColumns>;

export interface ITasksColumnsMethods {}

// For statics
export interface TasksColumnsModel extends Model<ITasksColumns, {}, ITasksColumnsMethods> {}
