import { IColumn } from './column';

export interface IGetAllTypesParams {}

export interface IGetAllColumnsByBoard {
  boardId: string;
}

export interface ICreateColumnParams {
  boardId: string;
  typeId: string;
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
