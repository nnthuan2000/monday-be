import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';

export interface IColumn {
  name: string;
  position: number;
  belongType: Types.ObjectId;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface IDeleteAllColumns {
  boardId: Types.ObjectId;
  session: ClientSession;
}

export interface ICreateNewColumns {
  boardId: Types.ObjectId;
  session: ClientSession;
}

// For instance methods

export type IColumnDoc = Doc<IColumn, IColumnMethods>;
export type IColumnDocObj = DocObj<IColumn>;

export interface IColumnMethods {}

// For statics
export interface ColumnModel extends Model<IColumn, {}, IColumnMethods> {
  createNewColumns({ boardId, session }: ICreateNewColumns): Promise<IColumnDoc[]>;
  deleteAllColumns({ boardId, session }: IDeleteAllColumns): Promise<null>;
}
