import { ClientSession } from 'mongoose';
import { IGroup } from './group';

export interface IGroupsParams {
  groupIds: string[];
}

export interface ICreateGroupParams extends IGroupsParams {
  boardId: string;
  data: IGroup;
}

export interface IUpdateGroupParams {
  groupId: string;
  updationData: Partial<IGroup>;
  session?: ClientSession | null;
}

export interface IUpdateAllGroupsParams extends IGroupsParams {
  session?: ClientSession | null;
}

export interface IDeleteGroupParams extends IGroupsParams {
  boardId: string;
  groupId: string;
}
