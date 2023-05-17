import { Types } from 'mongoose';
import { IDefaultValue } from './defaultValue';

export interface IGetAllValuesByTypeParams {
  boardId: string;
  typeId: string;
}

export interface ICreateValueByTypeParams {
  boardId: string;
  typeId: string;
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
