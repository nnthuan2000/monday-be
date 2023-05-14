import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';

export interface IGroup {
  name: string;
  position: number;
  tasks: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewGroups {
  amount: number;
  boardId: Types.ObjectId;
  columnIds: Types.ObjectId[];
  session: ClientSession | null;
}

export interface IDeleteGroup {
  boardId: Types.ObjectId | string;
  groupId: Types.ObjectId | string;
  session: ClientSession | null;
}

// For instance methods

export type IGroupDoc = Doc<IGroup, IGroupMethods>;
export type IGroupDocObj = DocObj<IGroup>;

export interface IGroupMethods {}

// For statics
export interface GroupModel extends Model<IGroup, {}, IGroupMethods> {
  createNewGroups({
    amount,
    boardId,
    columnIds,
    session,
  }: ICreateNewGroups): Promise<NonNullable<IGroupDoc>[]>;
  deleteGroup({ boardId, session }: IDeleteGroup): Promise<null>;
}
