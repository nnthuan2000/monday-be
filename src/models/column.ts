import { Schema, Types } from 'mongoose';

import {
  ColumnModel,
  IColumn,
  IColumnDoc,
  IColumnMethods,
  ICreateNewColumn,
  ICreateNewColumnResult,
  ICreateNewColumns,
  IDeleteColumn,
} from '../05-column/interfaces/column';
import db from '../root/db';
import Type from './type';
import { MultipleValueTypes, SingleValueTypes } from '../05-column/constant';
import Board from './board';
import { BadRequestError } from '../root/responseHandler/error.response';
import TasksColumns from './tasksColumns';
import DefaultValue from './defaultValue';

const DOCUMENT_NAME = 'Column';
const COLLECTION_NAME = 'Columns';

// Declare the Schema of the Mongo model
var columnSchema = new Schema<IColumn, ColumnModel, IColumnMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    belongType: {
      type: Schema.Types.ObjectId,
      reuqired: true,
      ref: 'Type',
    },
    defaultValues: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'DefaultValue',
        },
      ],
      default: [],
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

columnSchema.static(
  'createNewColumn',
  async function createNewColumn({
    boardId,
    typeId,
    userId,
    position,
    session,
  }: ICreateNewColumn): Promise<ICreateNewColumnResult> {
    const foundType = await Type.findById(typeId, {}, { session });
    if (!foundType) throw new BadRequestError('Type is not found');

    const createdNewDefaultValues = await DefaultValue.createNewDefaultValuesByColumn({
      boardId: new Types.ObjectId(boardId),
      typeDoc: foundType,
      createdBy: userId,
      session,
    });

    const [createdNewColumn] = await this.create([
      {
        name: foundType.name,
        belongType: foundType._id,
        position,
        defaultValues: createdNewDefaultValues.map((value) => value._id),
      },
    ]);

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      {
        $push: {
          columns: createdNewColumn,
        },
      },
      { session }
    );
    if (!updatedBoard) throw new BadRequestError('Board is not found');

    const tasksColumnsIds = await TasksColumns.createTasksColumnsByColumn({
      boardDoc: updatedBoard,
      columnDoc: createdNewColumn,
      defaultValues: createdNewDefaultValues,
      session,
    });

    return {
      createdNewColumn,
      defaultValues: createdNewDefaultValues,
      tasksColumnsIds,
    };
  }
);

columnSchema.static(
  'createNewColumns',
  async function createNewColumns({
    boardId,
    userId,
    session,
  }: ICreateNewColumns): Promise<NonNullable<IColumnDoc>[]> {
    const findingStatusType = Type.findOne({ name: MultipleValueTypes.STATUS });
    const findingDateType = Type.findOne({ name: SingleValueTypes.DATE });
    const foundTypes = await Promise.all([findingStatusType, findingDateType]);

    const newColumnObjs: IColumn[] = [];
    for (const [index, type] of foundTypes.entries()) {
      const createdNewDefaultValues = await DefaultValue.createNewDefaultValuesByColumn({
        boardId: new Types.ObjectId(boardId),
        typeDoc: type!,
        createdBy: userId,
        session,
      });

      newColumnObjs.push({
        name: type!.name,
        position: index + 1,
        belongType: type!._id,
        defaultValues: createdNewDefaultValues.map((value) => value._id),
      });
    }

    const createdNewColumns = await this.insertMany(newColumnObjs, { session });

    const gettingDefaultValuesFromColPromises = createdNewColumns.map((column) =>
      column.populate([
        {
          path: 'belongType',
          select: '_id name color icon',
        },
        {
          path: 'defaultValues',
          select: '_id value color',
        },
      ])
    );

    return await Promise.all(gettingDefaultValuesFromColPromises);
  }
);

columnSchema.static(
  'deleteColumn',
  async function deleteColumn({ boardId, columnId, session }: IDeleteColumn) {
    const deletedColumn = await this.findByIdAndDelete(columnId, { session });
    if (!deletedColumn) throw new BadRequestError('Column is not found');

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      {
        $pull: {
          columns: deletedColumn._id,
        },
      },
      { session }
    );
    if (!updatedBoard) throw new BadRequestError('Board is not found');

    // Delete all values in this column
    const deleteTasksColumns = await TasksColumns.find(
      {
        belongColumn: { $in: deletedColumn._id },
      },
      {},
      { session }
    );

    // Remove all task id
    const deleteingTasksColumnsPromises = deleteTasksColumns.map((tasksColumns) =>
      TasksColumns.deleteTasksColumnsByColumn({
        tasksColumnsDoc: tasksColumns,
        session,
      })
    );

    await Promise.all(deleteingTasksColumnsPromises);
  }
);

//Export the model
const Column = db.model<IColumn, ColumnModel>(DOCUMENT_NAME, columnSchema);
export default Column;
