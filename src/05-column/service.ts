import Column from '../models/column';
import Type from '../models/type';
import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import { ICreateColumnResult } from './interfaces/controller';
import {
  ICreateColumnParams,
  IDeleteColumnParams,
  IUpdateColumnParams,
} from './interfaces/services';

export default class ColumnService {
  static async getAllTypes() {
    const foundAllTypes = await Type.find({}).lean();
    return foundAllTypes;
  }

  static async createColumn({
    boardId,
    typeId,
    position,
  }: ICreateColumnParams): Promise<ICreateColumnResult> {
    if (!typeId || !position)
      throw new BadRequestError('Missing some fields to create a new column');
    const foundType = await Type.findById(typeId);

    if (!foundType) throw new BadRequestError('Type is not found');

    return await performTransaction<ICreateColumnResult>(async (session) => {
      const { createdNewColumns, updatedTasks } = await Column.createNewColumns({
        boardId,
        typeDoc: foundType,
        position: position,
        session,
      });
      return {
        createdNewColumn: createdNewColumns[0],
        tasks: updatedTasks,
      };
    });
  }

  static async updateColumn({ columnId, updationData }: IUpdateColumnParams) {
    if (updationData.belongType) throw new BadRequestError(`Column can't change type`);
    const updatedColumn = await Column.findByIdAndUpdate(columnId, updationData, {
      new: true,
    }).lean();
    if (!updatedColumn) throw new BadRequestError('Column is not found');
    return updatedColumn;
  }

  static async deleteColumn({ boardId, columnId }: IDeleteColumnParams) {
    return await performTransaction(async (session) => {
      await Column.deleteColumn({
        boardId,
        columnId,
        session,
      });
    });
  }
}
