import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';

export interface IWorkspace {
  name: string;
  description?: string;
  isMain: boolean;
  createdBy: Types.ObjectId;
  boards: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface IDeleteWorkspace {
  workspaceId: string;
  session: ClientSession;
}

// For instance methods

export type IWorkspaceDoc = Doc<IWorkspace, IWorkspaceMethods>;
export type IWorkspaceDocObj = DocObj<IWorkspace>;

export interface IWorkspaceMethods {}

// For statics
export interface WorkspaceModel extends Model<IWorkspace, {}, IWorkspaceMethods> {
  deleteWorkspace({ workspaceId, session }: IDeleteWorkspace): Promise<null>;
}
