import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import { ITaskDoc } from './task';

export interface ICreateTaskResult {
  createdNewTask: NonNullable<ITaskDoc>;
  defaultValues: IDefaultValueDoc[];
}
