import { Types } from 'mongoose';
import { IDefaultValueDoc } from '../08-value/interfaces/defaultValue';
import Column from '../models/column';
import Type from '../models/type';
import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import { IColumnDoc } from './interfaces/column';
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
      let createdNewColumn: IColumnDoc = null;
      let defaultValues: IDefaultValueDoc[] = [];
      let tasksColumnsIds: Types.ObjectId[] = [];
      const workingColumnPromises: Promise<IColumnDoc>[] = [];
      for (const [index, column] of columns.entries()) {
        if (column._id) {
          const updatedColumn = Column.findByIdAndUpdate(
            column._id,
            {
              $set: {
                position: index + 1,
              },
            },
            { session }
          );
          workingColumnPromises.push(updatedColumn);
        } else {
          const createdNewColumnInfo = await Column.createNewColumn({
            boardId,
            typeId: column.belongType,
            position: index + 1,
            userId,
            session,
          });
          createdNewColumn = createdNewColumnInfo.createdNewColumn;
          defaultValues = createdNewColumnInfo.defaultValues;
          tasksColumnsIds = createdNewColumnInfo.tasksColumnsIds;
        }
      }
      await Promise.all(workingColumnPromises);
      return { createdNewColumn, defaultValues, tasksColumnsIds };
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

  static async updateAllColumns({ columns, session = null }: IUpdateAllColumnsParams) {
    if (!session) {
      return await performTransaction(async (session) => {
        const updatingColumnPromises = columns.map((column, index) =>
          Column.findByIdAndUpdate(
            column?._id,
            {
              $set: {
                position: index + 1,
              },
            },
            { session }
          )
        );

        return await Promise.all(updatingColumnPromises);
      });
    } else {
      const updatingColumnPromises = columns.map((column, index) =>
        Column.findByIdAndUpdate(
          column?._id,
          {
            $set: {
              position: index + 1,
            },
          },
          { session }
        )
      );

      return await Promise.all(updatingColumnPromises);
    }
  }

  static async deleteColumn({ boardId, columns, columnId }: IDeleteColumnParams) {
    return await performTransaction(async (session) => {
      await Column.deleteColumn({
        boardId,
        columnId,
        session,
      });
      await this.updateAllColumns({ columns, session });
    });
  }
}
