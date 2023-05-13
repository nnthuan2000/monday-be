import {
  ICreateBoardParams,
  IDeleteBoardParams,
  IGetAllBoardsParams,
  IGetBoardParams,
  ISearchBoardsParams,
  IUpdateBoardParams,
} from './interfaces/services';
import { BadRequestError } from '../root/responseHandler/error.response';
import QueryTransform from '../root/utils/queryTransform';
import { IBoard } from './interfaces/board';
import Board from '../models/board';
import Workspace from '../models/workspace';
import { performTransaction } from '../root/utils/performTransaction';

export default class BoardService {
  static async searchBoards({ keyString }: ISearchBoardsParams) {
    const foundBoards = await Board.find(
      {
        $text: {
          $search: keyString,
        },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .select('_id name')
      .lean();
    return foundBoards;
  }

  static async getAllBoards({ workspaceId, fields, requestQuery }: IGetAllBoardsParams) {
    const foundWorkspace = await Workspace.findById(workspaceId);
    if (!foundWorkspace) throw new BadRequestError('Workspace is not found');
    const boardQuery = new QueryTransform<IBoard>(
      Board.find({ _id: { $in: foundWorkspace._id } }),
      requestQuery
    )
      .filter()
      .sort()
      .limitFields(fields)
      .paginate();
    const foundBoards = await boardQuery.getQuery();
    return foundBoards;
  }

  static async getBoard({ boardId }: IGetBoardParams) {
    const foundBoard = await Board.findById(boardId).lean();
    if (!foundBoard) throw new BadRequestError('Board is not found');

    //* Get all values of columns, groups, tasks and values
    // Get all columns

    // Get all groups

    return foundBoard;
  }

  static async createBoard({ workspaceId, data }: ICreateBoardParams) {
    const foundWorkspace = await Workspace.findById(workspaceId);
    if (!foundWorkspace) throw new BadRequestError('Workspace is not exist');
    return await performTransaction(async (session) => {
      const createdNewBoard = await Board.createNewBoard({
        workspaceDoc: foundWorkspace,
        data,
        session,
      });

      return createdNewBoard;
    });
  }

  static async updateBoard({ boardId, updationData }: IUpdateBoardParams) {
    const updatedBoard = await Board.findByIdAndUpdate(boardId, updationData, { new: true });
    if (!updatedBoard) throw new BadRequestError('Board is not found');
    return updatedBoard;
  }

  static async deleteBoard({ boardId }: IDeleteBoardParams) {
    const foundBoard = await Board.findById(boardId).lean();
    if (!foundBoard) throw new BadRequestError('Board is not found');
    return await performTransaction(async (session) => {
      await Board.deleteAllBoards({ boardIds: [foundBoard._id], session });
    });
  }
}
