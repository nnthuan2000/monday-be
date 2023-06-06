import Board from '../models/board';
import DefaultValue from '../models/defaultValue';
import TasksColumns from '../models/tasksColumns';
import { BadRequestError, NotFoundError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateValueByTypeParams,
  IDeleteValueByTypeParams,
  ISelectValueParams,
  IUpdateValueByTypeParams,
} from './interfaces/services';
import { SingleValueTypes } from '../05-column/constant';
import Column from '../models/column';
import { IColumnDocWithType } from '../05-column/interfaces/column';
import { checkValidType } from '../root/utils/validator';
import validator from 'validator';

export default class ValueService {
  static async createValueByType({ boardId, columnId, userId, data }: ICreateValueByTypeParams) {
    if (!validator.isMongoId(boardId)) throw new BadRequestError(`Board Id: ${boardId} is invalid`);
    if (!validator.isMongoId(columnId))
      throw new BadRequestError(`Column Id: ${columnId} is invalid`);

    if (!(data.hasOwnProperty('value') && data.hasOwnProperty('color')))
      throw new BadRequestError('Missing some fields to create a new value');

    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) throw new NotFoundError('Board is not found');
    const foundColumn = (await Column.findById(columnId).populate({
      path: 'belongType',
      select: '_id name',
    })) as IColumnDocWithType;
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
    if (!validator.isMongoId(defaultValueId))
      throw new BadRequestError(`Value Id: ${defaultValueId} is invalid`);

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
    if (!validator.isMongoId(tasksColumnsId))
      throw new BadRequestError(`Value id of task: ${tasksColumnsId} is invalid`);

    const foundTasksColumns = await TasksColumns.findById(tasksColumnsId);
    if (!foundTasksColumns) throw new NotFoundError('This box is not found');

    if (valueId) {
      if (foundTasksColumns.typeOfValue === 'single')
        throw new BadRequestError('Invalid data transmitted');
      if (!validator.isMongoId(valueId))
        throw new BadRequestError(`Value Id: ${valueId} is invalid`);

      const foundDefaultValue = await DefaultValue.findById(valueId).lean();
      if (!foundDefaultValue) throw new NotFoundError(`Default value of ${valueId} is not found`);
      foundTasksColumns.valueId = foundDefaultValue._id;
      return await foundTasksColumns.save();
    }

    if (foundTasksColumns.typeOfValue === 'multiple')
      throw new BadRequestError('Invalid data transmitted');

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
    if (!validator.isMongoId(defaultValueId))
      throw new BadRequestError(`Value Id: ${defaultValueId} is invalid`);

    if (!validator.isMongoId(columnId))
      throw new BadRequestError(`Column Id: ${columnId} is invalid`);
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
