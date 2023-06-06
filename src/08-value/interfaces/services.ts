import { Types } from 'mongoose';
import { IDefaultValue } from './defaultValue';

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

export interface ISelectValueParams {
  valueId: string | null;
  value: string;
  tasksColumnsId: string;
}

export interface IDeleteValueByTypeParams {
  columnId: string;
  defaultValueId: string;
}
