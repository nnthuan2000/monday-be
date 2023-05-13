import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';

export interface IBoard {
  name: string;
  description: string;
  isCreatedView: boolean;
  belongWorkspace: Types.ObjectId;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface IDeleteAllBoards {
  workspaceId: Types.ObjectId;
  session: ClientSession;
}

// For instance methods

export type IBoardDoc = Doc<IBoard, IBoardMethods>;
export type IBoardDocObj = DocObj<IBoard>;

export interface IBoardMethods {}

// For statics
export interface BoardModel extends Model<IBoard, {}, IBoardMethods> {
  deleteAllBoards({ workspaceId, session }: IDeleteAllBoards): Promise<null>;
}
