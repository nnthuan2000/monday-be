import { Types } from 'mongoose';
import { IDefaultValue } from './defaultValue';

export interface IGetAllValuesByTypeParams {
  boardId: string;
  columnId: string;
}

export interface ICreateValueByTypeParams {
  boardId: string;
  columnId: string;
  userId: Types.ObjectId;
  data: IDefaultValue;
}

export interface IUpdateValueByTypeParams {
  defaultValueId: string;
  updationData: Partial<IDefaultValue>;
}

export interface ISetValueParams {
  valueId?: string;
  value?: string;
  tasksColumnsId: string;
}

export interface IDeleteValueByTypeParams {
  defaultValueId: string;
}
