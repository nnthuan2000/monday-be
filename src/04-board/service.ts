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
      Board.find({ _id: { $in: foundWorkspace.boards } }),
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
    const foundBoard = await Board.findById(boardId)
      .populate({
        path: 'columns',
        select: '_id name position belongType',
        options: {
          sort: { position: 1 },
        },
        populate: [
          {
            path: 'belongType defaultValues',
            select: '_id name icon color',
          },
          {
            path: 'defaultValues',
            select: '_id value color',
          },
        ],
      })
      .populate({
        path: 'groups',
        select: '_id name position',
        options: {
          sort: { position: 1 },
        },
        populate: {
          path: 'tasks',
          select: '_id name description position values',
          options: {
            sort: { position: 1 },
          },
          populate: {
            path: 'values',
            select: '_id value valueId typeOfValue belongColumn',
            populate: {
              path: 'valueId',
              select: '_id value color',
            },
          },
        },
      })
      .lean();
    if (!foundBoard) throw new BadRequestError('Board is not found');

    return foundBoard;
  }

  static async createBoard({ workspaceId, userId, data }: ICreateBoardParams) {
    const foundWorkspace = await Workspace.findById(workspaceId);
    if (!foundWorkspace) throw new BadRequestError('Workspace is not exist');
    return await performTransaction(async (session) => {
      const createdNewBoard = await Board.createNewBoard({
        workspaceDoc: foundWorkspace,
        userId,
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

  static async deleteBoard({ workspaceId, boardId }: IDeleteBoardParams) {
    return await performTransaction(async (session) => {
      await Board.deleteBoard({ workspaceId, boardId, session });
    });
  }
}
