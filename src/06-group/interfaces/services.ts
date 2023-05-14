import { IGroup } from './group';

export interface ICreateGroupParams {
  boardId: string;
  data: IGroup;
}

export interface IUpdateGroupParams {
  groupId: string;
  updationData: Partial<IGroup>;
}

export interface IDeleteGroupParams {
  boardId: string;
  groupId: string;
}
