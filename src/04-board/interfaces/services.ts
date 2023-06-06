import { Types } from 'mongoose';
import { IBoard } from './board';

export interface ISearchBoardsParams {
  keyString: string;
}

export interface IGetBoardParams {
  boardId: string;
}

export interface ICreateBoardParams {
  workspaceId: string;
  userId: Types.ObjectId;
  data: IBoard;
}

export interface IUpdateBoardParams {
  boardId: string;
  updationData: Partial<IBoard>;
}

export interface IDeleteBoardParams {
  workspaceId: string;
  boardId: string;
}
