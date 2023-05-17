import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IColumnDoc } from '../../05-column/interfaces/column';

export interface IGroup {
  name: string;
  position: number;
  tasks: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewGroups {
  boardId: Types.ObjectId | string;
  columns?: NonNullable<IColumnDoc>[];
  data?: IGroup;
  session: ClientSession;
}

export interface IDeleteGroup {
  boardId?: string;
  groupId: Types.ObjectId | string;
  session: ClientSession;
}

// For instance methods

export type IGroupDoc = Doc<IGroup, IGroupMethods>;
export type IGroupDocObj = DocObj<IGroup>;

export interface IGroupMethods {}

// For statics
export interface GroupModel extends Model<IGroup, {}, IGroupMethods> {
  createNewGroups({
    boardId,
    columns,
    data,
    session,
  }: ICreateNewGroups): Promise<NonNullable<IGroupDoc>[]>;
  deleteGroup({ boardId, session }: IDeleteGroup): Promise<null>;
}
