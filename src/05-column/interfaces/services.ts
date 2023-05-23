import { Types } from 'mongoose';
import { IColumn } from './column';

export interface IGetAllTypesParams {}

export interface ICreateColumnParams {
  boardId: string;
  typeId: string;
  userId: Types.ObjectId;
  position: number;
}

export interface IUpdateColumnParams {
  columnId: string;
  updationData: Partial<IColumn>;
}

export interface IDeleteColumnParams {
  boardId: string;
  columnId: string;
}
