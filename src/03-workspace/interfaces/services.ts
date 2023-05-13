import { Types } from 'mongoose';
import { IWorkspace } from './workspace';
import { IRequestQuery } from '../../root/app.interfaces';

export interface ISearchWorkspaceParams {
  keyString: string;
}

export interface IGetMainWorkspaceParams {
  fields: string;
  userId: Types.ObjectId;
}

export interface IGetAllWorkspacesParams extends IGetMainWorkspaceParams {
  userId: Types.ObjectId;
  requestQuery: IRequestQuery;
}

export interface IGetWorkspaceParams {
  workspaceId: string;
}

export interface ICreateWorkspaceParams {
  userId: Types.ObjectId;
  data: IWorkspace;
}

export interface IUpdateWorkspaceParams {
  workspaceId: string;
  updationData: Partial<IWorkspace>;
}

export interface IDeleteWorkspaceParams {
  workspaceId: string;
}
