import { Types } from 'mongoose';
import { IColumn, IColumnForCreate, IColumnWithId } from './column';

export interface IGetAllColumnsByBoard {
  boardId: string;
}

export interface ICreateColumnParams {
  boardId: string;
  userId: Types.ObjectId;
  data: IColumnForCreate;
}

export interface IUpdateColumnParams {
  columnId: string;
  updationData: Partial<IColumn>;
}

export interface IUpdateAllColumnsParams {
  boardId: string;
  columns: IColumnWithId[];
}

export interface IDeleteColumnParams {
  boardId: string;
  columnId: string;
}
