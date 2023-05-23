import Board from '../models/board';
import DefaultValue from '../models/defaultValue';
import TasksColumns from '../models/tasksColumns';
import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateValueByTypeParams,
  IDeleteValueByTypeParams,
  IGetAllValuesByTypeParams,
  ISetValueParams,
  IUpdateValueByTypeParams,
} from './interfaces/services';
import { SingleValueTypes } from '../05-column/constant';
import Column from '../models/column';
import { IColumnDocWithType } from '../05-column/interfaces/column';

export default class ValueService {
  static async getAllValuesByType({ boardId, columnId }: IGetAllValuesByTypeParams) {
    const foundColumn = await Column.findById(columnId).lean();
    if (!foundColumn) throw new BadRequestError('Column is not found');

    const foundAllValues = await DefaultValue.find({
      belongBoard: { $in: [boardId, null] },
      belongType: foundColumn.belongType,
    })
      .select('_id value color')
      .lean();
    return foundAllValues;
  }

  static async createValueByType({ boardId, columnId, userId, data }: ICreateValueByTypeParams) {
    const foundBoard = await Board.findById(boardId);
    const foundColumn = (await Column.findById(columnId).populate({
      path: 'belongType',
      select: '_id name',
    })) as IColumnDocWithType;
    if (!foundBoard) throw new BadRequestError('Board is not found');
    if (!foundColumn) throw new BadRequestError('Column is not found');
    if (Object.values(SingleValueTypes).includes(foundColumn.belongType.name as SingleValueTypes)) {
      throw new BadRequestError(`This type can not create more value`);
    }

    const createdNewValue = await DefaultValue.create({
      ...data,
      belongBoard: boardId,
      belongType: foundColumn.belongType,
      createdBy: userId,
    });
    return createdNewValue;
  }

  static async updateValueByType({ defaultValueId, updationData }: IUpdateValueByTypeParams) {
    return await performTransaction(async (session) => {
      const updatedValue = await DefaultValue.findByIdAndUpdate(defaultValueId, updationData, {
        new: true,
        session,
      }).lean();
      if (!updatedValue) throw new BadRequestError('Value is not found');
      if (!updatedValue.canEditColor && updationData.color)
        throw new BadRequestError(`This type can't edit color`);
      return updatedValue;
    });
  }

  static async setValue({ tasksColumnsId, value, valueId }: ISetValueParams) {
    if (!value && !valueId) throw new BadRequestError('Invalid transmitted data');
    if (valueId) {
      const foundDefaultValue = await DefaultValue.findById(valueId).lean();
      if (!foundDefaultValue) throw new BadRequestError('Value is not found');
    }

    const updatedTasksColumns = await TasksColumns.findByIdAndUpdate(tasksColumnsId, {
      $set: {
        value,
        valueId,
      },
    });
    if (!updatedTasksColumns) throw new BadRequestError('This box is not found');
    return updatedTasksColumns;
  }

  static async deleteValueByType({ defaultValueId }: IDeleteValueByTypeParams) {
    return await performTransaction(async (session) => {
      const deletedValue = await DefaultValue.findByIdAndDelete(defaultValueId, { session });
      if (!deletedValue) throw new BadRequestError('Value is not found');
      if (!deletedValue.belongBoard)
        throw new BadRequestError(`Default value of this type can't deleted`);

      const foundBoardWithColumns = await Board.findById(deletedValue.belongBoard).populate({
        path: 'columns',
        select: '_id',
      });

      const foundAllTasksColumnsInBoard = await TasksColumns.find(
        {
          valueId: deletedValue._id,
          belongColumn: { $in: foundBoardWithColumns?.columns },
        },
        {},
        { session }
      );

      if (foundAllTasksColumnsInBoard.length !== 0)
        throw new BadRequestError(`You can't delete value while in use`);
      return deletedValue;
    });
  }
}
