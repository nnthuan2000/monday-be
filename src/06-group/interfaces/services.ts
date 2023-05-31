import { ClientSession } from 'mongoose';
import { IGroup, IGroupDoc, IGroupForCreate } from './group';

export interface ICreateGroupParams {
  boardId: string;
  data: IGroupForCreate;
}

export interface IUpdateGroupParams {
  groupId: string;
  updationData: Partial<IGroup>;
  session?: ClientSession | null;
}

export interface IUpdateAllGroupsParams {
  boardId: string;
  groups: NonNullable<IGroupDoc>[];
}

export interface IDeleteGroupParams {
  boardId: string;
  groupId: string;
}
