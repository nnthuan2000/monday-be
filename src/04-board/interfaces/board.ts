import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IWorkspaceDoc } from '../../03-workspace/interfaces/workspace';
import { IColumnDoc } from '../../05-column/interfaces/column';

export interface IBoard {
  name: string;
  description: string;
  isCreatedView: boolean;
  belongWorkspace: Types.ObjectId;
  columns: Types.ObjectId[];
  groups: Types.ObjectId[];
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewBoard {
  workspaceDoc: NonNullable<IWorkspaceDoc>;
  data: IBoard;
  session: ClientSession;
}

export interface IDeleteBoard {
  boardId: Types.ObjectId | string;
  session: ClientSession;
}

// For instance methods

export type IBoardDoc = Doc<IBoard, IBoardMethods>;
export type IBoardDocObj = DocObj<IBoard>;

export interface IBoardMethods {}

export type ICreateNewBoardResult = NonNullable<IBoardDoc> & {
  columns: NonNullable<IColumnDoc>[];
};

// For statics
export interface BoardModel extends Model<IBoard, {}, IBoardMethods> {
  createNewBoard({ workspaceDoc, data, session }: ICreateNewBoard): Promise<ICreateNewBoardResult>;
  deleteBoard({ boardId, session }: IDeleteBoard): Promise<null>;
}
