import {
  ICreateBoardParams,
  IDeleteBoardParams,
  IGetBoardParams,
  ISearchBoardsParams,
  IUpdateBoardParams,
} from './interfaces/services';
import { BadRequestError, NotFoundError } from '../root/responseHandler/error.response';
import Board from '../models/board';
import Workspace from '../models/workspace';
import { performTransaction } from '../root/utils/performTransaction';
import validator from 'validator';

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

  static async getBoard({ boardId }: IGetBoardParams) {
    if (!validator.isMongoId(boardId)) throw new BadRequestError(`Board Id: ${boardId} is invalid`);
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
    if (!foundBoard) throw new NotFoundError('Board is not found');

    return foundBoard;
  }

  static async createBoard({ workspaceId, userId, data }: ICreateBoardParams) {
    if (!validator.isMongoId(workspaceId))
      throw new BadRequestError(`Workspace Id: ${workspaceId} is invalid`);
    const foundWorkspace = await Workspace.findById(workspaceId);
    if (!foundWorkspace) throw new NotFoundError('Workspace is not exist');
    if (!data.hasOwnProperty('name'))
      throw new BadRequestError('Missing name field to create a new board');
    if (data.name.length === 0) throw new BadRequestError(`Name of board can't not be emptied`);

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
    if (!validator.isMongoId(boardId)) throw new BadRequestError(`Board Id: ${boardId} is invalid`);

    if (updationData.hasOwnProperty('groups') || updationData.hasOwnProperty('columns'))
      throw new BadRequestError(`Can't not edit these fields: groups, columns`);
    const updatedBoard = await Board.findByIdAndUpdate(boardId, updationData, { new: true });
    if (!updatedBoard) throw new NotFoundError('Board is not found');
    return updatedBoard;
  }

  static async deleteBoard({ workspaceId, boardId }: IDeleteBoardParams) {
    if (!validator.isMongoId(workspaceId))
      throw new BadRequestError(`Workspace Id: ${workspaceId} is invalid`);
    if (!validator.isMongoId(boardId)) throw new BadRequestError(`Board Id: ${boardId} is invalid`);
    return await performTransaction(async (session) => {
      await Board.deleteBoard({ workspaceId, boardId, session });
    });
  }
}
