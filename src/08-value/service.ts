import Board from '../models/board';
import DefaultValue from '../models/defaultValue';
import TasksColumns from '../models/tasksColumns';
import Type from '../models/type';
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

export default class ValueService {
  static async getAllValuesByType({ boardId, typeId }: IGetAllValuesByTypeParams) {
    const foundType = await Type.findById(typeId);
    if (!foundType) throw new BadRequestError('Type is not found');

    const foundAllValues = await DefaultValue.find({
      belongBoard: { $in: [boardId, null] },
      belongType: foundType._id,
    })
      .select('_id value color')
      .lean();
    return foundAllValues;
  }

  static async createValueByType({ boardId, typeId, userId, data }: ICreateValueByTypeParams) {
    const findingBoardPromise = Board.findById(boardId);
    const findingTypePromise = Type.findById(typeId);
    const [foundBoard, foundType] = await Promise.all([findingBoardPromise, findingTypePromise]);
    if (!foundBoard) throw new BadRequestError('Board is not found');
    if (!foundType) throw new BadRequestError('Type is not found');
    if (Object.values(SingleValueTypes).includes(foundType.name as SingleValueTypes)) {
      throw new BadRequestError(`This type can not create more value`);
    }

    const createdNewValue = await DefaultValue.create({
      ...data,
      belongBoard: boardId,
      belongType: typeId,
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
      if (!updatedValue.canEditColor && updatedValue.color)
        throw new BadRequestError(`This type can't edit color`);
      return updatedValue;
    });
  }

  static async setValue({ tasksColumnsId, value, valueId }: ISetValueParams) {
    if ((value && valueId) || (!value && !valueId))
      throw new BadRequestError('Invalid transmitted data');
    if (valueId) {
      const foundDefaultValue = await DefaultValue.findById(valueId).lean();
      if (!foundDefaultValue) throw new BadRequestError('Value is not found');
    }
    console.log(value, valueId, tasksColumnsId);

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
