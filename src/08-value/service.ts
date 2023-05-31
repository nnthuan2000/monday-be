import Board from '../models/board';
import DefaultValue from '../models/defaultValue';
import TasksColumns from '../models/tasksColumns';
import { BadRequestError, NotFoundError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateValueByTypeParams,
  IDeleteValueByTypeParams,
  IGetAllValuesByTypeParams,
  ISelectValueParams,
  IUpdateValueByTypeParams,
} from './interfaces/services';
import { SingleValueTypes } from '../05-column/constant';
import Column from '../models/column';
import { IColumnDocWithType } from '../05-column/interfaces/column';
import { checkValidType } from '../root/utils/validator';

export default class ValueService {
  static async getAllValuesByType({ boardId, columnId }: IGetAllValuesByTypeParams) {
    const foundColumn = await Column.findById(columnId).lean();
    if (!foundColumn) throw new NotFoundError('Column is not found');

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
    if (!foundBoard) throw new NotFoundError('Board is not found');
    if (!foundColumn) throw new NotFoundError('Column is not found');
    if (Object.values(SingleValueTypes).includes(foundColumn.belongType.name as SingleValueTypes)) {
      throw new BadRequestError(`This type can not create more value`);
    }

    return await performTransaction(async (session) => {
      const [createdNewValue] = await DefaultValue.create(
        [
          {
            ...data,
            belongBoard: boardId,
            belongType: foundColumn.belongType,
            createdBy: userId,
          },
        ],
        { session }
      );

      await foundColumn.updateOne(
        {
          $push: {
            defaultValues: createdNewValue._id,
          },
        },
        { session }
      );

      return createdNewValue;
    });
  }

  static async updateValueByType({ defaultValueId, updationData }: IUpdateValueByTypeParams) {
    return await performTransaction(async (session) => {
      const updatedValue = await DefaultValue.findByIdAndUpdate(defaultValueId, updationData, {
        new: true,
        session,
      }).lean();
      if (!updatedValue) throw new NotFoundError('Value is not found');
      if (!updatedValue.canEditColor && updationData.color)
        throw new BadRequestError(`This type can't edit color`);
      return updatedValue;
    });
  }

  static async selectValue({ tasksColumnsId, value, valueId }: ISelectValueParams) {
    const foundTasksColumns = await TasksColumns.findById(tasksColumnsId);
    if (!foundTasksColumns) throw new NotFoundError('This box is not found');

    if (valueId) {
      const foundDefaultValue = await DefaultValue.findById(valueId).lean();
      if (!foundDefaultValue) throw new NotFoundError(`Default value of ${valueId} is not found`);
      foundTasksColumns.valueId = foundDefaultValue._id;
      return await foundTasksColumns.save();
    }

    const foundColumnWithType = (await Column.findById(foundTasksColumns.belongColumn)
      .populate({
        path: 'belongType',
        select: '_id name',
      })
      .lean()) as IColumnDocWithType;

    if (!foundColumnWithType) throw new NotFoundError('Column of this box is not found');

    const isValidType = checkValidType(
      foundColumnWithType.belongType.name as SingleValueTypes,
      value
    );

    if (!isValidType) throw new BadRequestError(`Value ${value} is incorrect format`);
    foundTasksColumns.value = value;
    return await foundTasksColumns.save();
  }

  static async deleteValueByType({ columnId, defaultValueId }: IDeleteValueByTypeParams) {
    return await performTransaction(async (session) => {
      const deletedValue = await DefaultValue.findByIdAndDelete(defaultValueId, { session });
      if (!deletedValue) throw new NotFoundError('Value is not found');
      if (!deletedValue.canEditColor)
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

      const updatedColumn = await Column.findByIdAndUpdate(
        columnId,
        {
          $pull: {
            defaultValues: deletedValue._id,
          },
        },
        { session }
      );

      if (!updatedColumn) throw new NotFoundError(`Column is not found`);
    });
  }
}
