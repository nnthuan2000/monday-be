import { ClientSession, Types } from 'mongoose';
import { IColumn, IColumnDoc, IColumnWithId } from './column';

export interface IGetAllTypesParams {}

export interface IColumnWithoutName {
  typeId: string;
  position: number;
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
  session?: ClientSession | null;
}

export interface IUpdateAllColumnsParams {
  columns: NonNullable<IColumnDoc>[];
  session?: ClientSession | null;
}

export interface IDeleteColumnParams {
  columns: NonNullable<IColumnDoc>[];
  boardId: string;
  columnId: string;
}
