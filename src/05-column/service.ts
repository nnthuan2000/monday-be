import Board from '../models/board';
import Column from '../models/column';
import Type from '../models/type';
import { BadRequestError, NotFoundError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import { ICreateNewColumnResult } from './interfaces/column';
import { ICreateColumnResult } from './interfaces/controller';
import {
  ICreateColumnParams,
  IDeleteColumnParams,
  IUpdateAllColumnsParams,
  IUpdateColumnParams,
} from './interfaces/services';

export default class ColumnService {
  static async getAllTypes() {
    const foundAllTypes = await Type.find({}).lean();
    return foundAllTypes;
  }

  static async createColumn({
    boardId,
    userId,
    columns,
  }: ICreateColumnParams): Promise<ICreateColumnResult> {
    return await performTransaction<ICreateColumnResult>(async (session) => {
      let creatingNewColumnInfoPromise: Promise<ICreateNewColumnResult> | null = null;
      const workingColumnPromises = columns.map((column, index) => {
        if (column._id) {
          return Column.findByIdAndUpdatePosition({
            columnId: column._id,
            position: index,
            session,
          });
        } else {
          creatingNewColumnInfoPromise = Column.createNewColumn({
            boardId,
            typeId: column.belongType,
            position: index,
            userId,
            session,
          });
        }
      });
      if (!creatingNewColumnInfoPromise)
        throw new BadRequestError('Missing some fields when create a new column');
      workingColumnPromises.unshift(creatingNewColumnInfoPromise);

      const [createdNewColumnInfo] = await Promise.all(workingColumnPromises);
      return createdNewColumnInfo;
    });
  }

  static async updateColumn({ columnId, updationData }: IUpdateColumnParams) {
    if (updationData.belongType) throw new BadRequestError(`Column can't change type`);
    if (updationData.position) throw new BadRequestError(`Can't modify position of column`);
    const updatedColumn = await Column.findByIdAndUpdate(columnId, updationData, {
      new: true,
    }).lean();
    if (!updatedColumn) throw new NotFoundError('Column is not found');
    return updatedColumn;
  }

  static async updateAllColumns({ boardId, columns }: IUpdateAllColumnsParams) {
    const foundBoard = await Board.findById(boardId).lean();

    if (!foundBoard) throw new NotFoundError('Board is not found');

    if (foundBoard.columns.length !== columns.length)
      throw new BadRequestError(
        'Please send all columns in a board to update all position of columns'
      );

    const totalNumOfColumns = columns.length;
    const totalDesiredPosition = (totalNumOfColumns * (0 + totalNumOfColumns - 1)) / 2;
    const totalPosition = columns.reduce((currTotal, column) => currTotal + column.position, 0);

    if (totalDesiredPosition !== totalPosition)
      throw new BadRequestError('Something wrong when transmitted position of columns');

    return await performTransaction(async (session) => {
      return await Column.updateAllColumns({
        columns,
        session,
      });
    });
  }

  static async deleteColumn({ boardId, columnId }: IDeleteColumnParams) {
    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) throw new NotFoundError('Board is not found');

    return await performTransaction(async (session) => {
      await Column.deleteColumn({
        boardDoc: foundBoard,
        columnId,
        session,
      });
    });
  }
}
