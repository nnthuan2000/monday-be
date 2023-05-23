import Column from '../models/column';
import Type from '../models/type';
import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
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
    columnIds,
    neededData,
  }: ICreateColumnParams): Promise<ICreateColumnResult> {
    const { position, typeId } = neededData;

    if (!typeId || !position)
      throw new BadRequestError('Missing some fields to create a new column');

    return await performTransaction<ICreateColumnResult>(async (session) => {
      const creatingNewColumnInfoPromise = Column.createNewColumn({
        boardId,
        typeId,
        position: position,
        userId,
        session,
      });

      const updaingAllColumnPromise = this.updateAllColumns({ columnIds });

      const [createdNewColumnInfo, _] = await Promise.all([
        creatingNewColumnInfoPromise,
        updaingAllColumnPromise,
      ]);

      return { ...createdNewColumnInfo };
    });
  }

  static async updateColumn({ columnId, updationData, session = null }: IUpdateColumnParams) {
    if (updationData.belongType) throw new BadRequestError(`Column can't change type`);
    const updatedColumn = await Column.findByIdAndUpdate(columnId, updationData, {
      new: true,
      session,
    }).lean();
    if (!updatedColumn) throw new BadRequestError('Column is not found');
    return updatedColumn;
  }

  static async updateAllColumns({ columnIds }: IUpdateAllColumnsParams) {
    return await performTransaction(async (session) => {
      const updatingAllColumnsPromises = columnIds.map((columnId, index) =>
        this.updateColumn({
          columnId,
          updationData: {
            position: index + 1,
          },
          session,
        })
      );

      const updatedAllColumns = await Promise.all(updatingAllColumnsPromises);
      return updatedAllColumns;
    });
  }

  static async deleteColumn({ boardId, columnId, columnIds }: IDeleteColumnParams) {
    return await performTransaction(async (session) => {
      await Column.deleteColumn({
        boardId,
        columnId,
        session,
      });
      await this.updateAllColumns({ columnIds });
    });
  }
}
