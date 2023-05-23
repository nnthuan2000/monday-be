import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IWorkspaceDoc } from '../../03-workspace/interfaces/workspace';
import { IColumnDoc } from '../../05-column/interfaces/column';
import { IGroupDoc } from '../../06-group/interfaces/group';

export interface IBoard {
  name: string;
  description: string;
  isCreatedView: boolean;
  belongWorkspace: Types.ObjectId;
  columns: Types.ObjectId[] | IColumnDoc[];
  groups: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewBoard {
  workspaceDoc: NonNullable<IWorkspaceDoc>;
  userId: Types.ObjectId;
  data: IBoard;
  session: ClientSession;
}

export interface IDeleteBoard {
  workspaceId?: string;
  boardId: Types.ObjectId | string;
  session: ClientSession;
}

// For instance methods

export type IBoardDoc = Doc<IBoard, IBoardMethods>;
export type IBoardDocObj = DocObj<IBoard>;

export interface IBoardMethods {}

export type ICreateNewBoardResult = NonNullable<IBoardDoc> & {
  columns: NonNullable<IColumnDoc>[];
  groups: NonNullable<IGroupDoc>[];
};

// For statics
export interface BoardModel extends Model<IBoard, {}, IBoardMethods> {
  createNewBoard({ workspaceDoc, data, session }: ICreateNewBoard): Promise<IBoardDoc>;
  deleteBoard({ workspaceId, boardId, session }: IDeleteBoard): Promise<null>;
}
