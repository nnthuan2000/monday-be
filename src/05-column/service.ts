import Column from '../models/column';
import DefaultValue from '../models/defaultValue';
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
    const findingTypePromise = Type.findById(typeId);
    const findingDefaultValuePromise = DefaultValue.findOne({
      belongType: typeId,
    }).select('value color');
    const [foundType, foundDefaultValue] = await Promise.all([
      findingTypePromise,
      findingDefaultValuePromise,
    ]);
    if (!foundType) throw new BadRequestError('Type is not found');
    if (!foundDefaultValue) throw new Error('Default value of this type is not found');
    console.log(foundDefaultValue);

    return await performTransaction<ICreateColumnResult>(async (session) => {
      const [createdNewColumn] = await Column.createNewColumns({
        boardId,
        typeDoc: foundType,
        position: position,
        session,
      });
      return {
        createdNewColumn,
        defaultValue: foundDefaultValue,
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
