import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import { IColumnDoc } from '../../05-column/interfaces/column';
import { IBoardDoc } from '../../04-board/interfaces/board';

export interface IGroup {
  name: string;
  position: number;
  tasks: Types.ObjectId[];
}

export interface IGroupWithId extends IGroup {
  _id?: string;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface IFindByIdAndUpdatePosition {
  groupId: string | Types.ObjectId;
  position: number;
  session: ClientSession;
}

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

export interface IUpdateAllPositionGroups {
  groups: NonNullable<IGroupDoc>[];
  session: ClientSession;
}

export interface IDeleteGroup {
  boardDoc?: NonNullable<IBoardDoc>;
  groupId: Types.ObjectId | string;
  session: ClientSession;
}

// For instance methods

export type IGroupDoc = Doc<IGroup, IGroupMethods>;
export type IGroupDocObj = DocObj<IGroup>;

export interface IGroupMethods {}

// For statics
export interface GroupModel extends Model<IGroup, {}, IGroupMethods> {
  findByIdAndUpdatePosition({
    groupId,
    position,
    session,
  }: IFindByIdAndUpdatePosition): Promise<NonNullable<IGroupDoc>>;

  createNewGroup({ boardId, data, session }: ICreateNewGroup): Promise<NonNullable<IGroupDoc>>;

  createNewGroups({
    columns,
    selectedDefaultValues,
    session,
  }: ICreateNewGroups): Promise<NonNullable<IGroupDoc>[]>;

  updateAllPositionGroups({
    groups,
    session,
  }: IUpdateAllPositionGroups): Promise<NonNullable<IGroupDoc>[]>;

  deleteGroup({ boardDoc, groupId, session }: IDeleteGroup): Promise<null>;
}
