import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import { IColumnDoc } from '../../05-column/interfaces/column';

export interface IGroup {
  name: string;
  position: number;
  tasks: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewGroup {
  boardId: string;
  data: IGroup;
  session: ClientSession;
}

export interface ICreateNewGroups {
  columns: NonNullable<IColumnDoc>[];
  selectedDefaultValues: IDefaultValueDoc[];
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
  createNewGroup({ boardId, data, session }: ICreateNewGroup): Promise<NonNullable<IGroupDoc>>;
  createNewGroups({
    columns,
    selectedDefaultValues,
    session,
  }: ICreateNewGroups): Promise<NonNullable<IGroupDoc>[]>;
  deleteGroup({ boardId, session }: IDeleteGroup): Promise<null>;
}
