import { ClientSession, Types } from 'mongoose';
import { IColumn } from './column';

export interface IGetAllTypesParams {}

export interface IColumnWithoutName {
  typeId: string;
  position: number;
}

export interface IColumnsParams {
  columnIds: string[];
}

export interface ICreateColumnParams extends IColumnsParams {
  boardId: string;
  userId: Types.ObjectId;
  neededData: IColumnWithoutName;
}

export interface IUpdateColumnParams {
  columnId: string;
  updationData: Partial<IColumn>;
  session?: ClientSession | null;
}

export interface IUpdateAllColumnsParams extends IColumnsParams {}

export interface IDeleteColumnParams extends IColumnsParams {
  boardId: string;
  columnId: string;
}
