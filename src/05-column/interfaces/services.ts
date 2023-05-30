import { Types } from 'mongoose';
import { IColumn, IColumnDoc, IColumnWithId } from './column';

export interface IGetAllTypesParams {}

export interface IGetAllColumnsByBoard {
  boardId: string;
}

export interface IColumnsParams {
  columns: IColumnWithId[];
}

export interface ICreateColumnParams extends IColumnsParams {
  boardId: string;
  userId: Types.ObjectId;
}

export interface IUpdateColumnParams {
  columnId: string;
  updationData: Partial<IColumn>;
}

export interface IUpdateAllColumnsParams {
  boardId: string;
  columns: NonNullable<IColumnDoc>[];
}

export interface IDeleteColumnParams {
  boardId: string;
  columnId: string;
}
