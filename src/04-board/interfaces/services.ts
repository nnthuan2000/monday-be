import { IRequestQuery } from '../../root/app.interfaces';
import { IBoard } from './board';

export interface ISearchBoardsParams {
  keyString: string;
}

export interface IGetAllBoardsParams {
  workspaceId: string;
  fields: string;
  requestQuery: IRequestQuery;
}

export interface IGetBoardParams {
  boardId: string;
}

export interface ICreateBoardParams {
  workspaceId: string;
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
