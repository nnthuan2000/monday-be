import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { IWorkspaceDoc } from '../../03-workspace/interfaces/workspace';

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

export interface IDeleteAllBoards {
  boardIds: Types.ObjectId[];
  session: ClientSession;
}

// For instance methods

export type IBoardDoc = Doc<IBoard, IBoardMethods>;
export type IBoardDocObj = DocObj<IBoard>;

export interface IBoardMethods {}

// For statics
export interface BoardModel extends Model<IBoard, {}, IBoardMethods> {
  createNewBoard({ workspaceDoc, data, session }: ICreateNewBoard): Promise<IBoardDoc>;
  deleteAllBoards({ boardIds, session }: IDeleteAllBoards): Promise<null>;
}
