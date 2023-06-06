import { Schema, Types } from 'mongoose';

import {
  ColumnModel,
  IColumn,
  IColumnDoc,
  IColumnMethods,
  ICreateNewColumn,
  ICreateNewColumnResult,
  ICreateNewColumns,
  ICreateNewColumnsResult,
  IDeleteColumn,
  IFindByColumnAndUpdatePosition,
  IUpdateAllColumns,
} from '../05-column/interfaces/column';
import db from '../root/db';
import Type from './type';
import { MultipleValueTypes, SingleValueTypes } from '../05-column/constant';
import { BadRequestError, NotFoundError } from '../root/responseHandler/error.response';
import TasksColumns from './tasksColumns';
import DefaultValue from './defaultValue';
import { IDefaultValueDoc } from '../08-value/interfaces/defaultValue';
import Task from './task';
import validator from 'validator';

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
  'findByIdAndUpdatePosition',
  async function findByIdAndUpdatePosition({
    columnId,
    position,
    session,
  }: IFindByColumnAndUpdatePosition): Promise<NonNullable<IColumnDoc>> {
    const updatedColumn = await this.findByIdAndUpdate(
      columnId,
      {
        $set: {
          position: position,
        },
      },
      { new: true, session }
    );
    if (!updatedColumn) throw new NotFoundError('Column is not found');

    return updatedColumn;
  }
);

columnSchema.static(
  'createNewColumn',
  async function createNewColumn({
    boardDoc,
    typeId,
    userId,
    position,
    session,
  }: ICreateNewColumn): Promise<ICreateNewColumnResult> {
    const foundType = await Type.findById(typeId, {}, { session }).select('_id name icon color');
    if (!foundType) throw new NotFoundError('Type is not found');

    const createdNewDefaultValues = await DefaultValue.createNewDefaultValuesByColumn({
      boardId: boardDoc._id,
      typeDoc: foundType,
      createdBy: userId,
      session,
    });

    const [createdNewColumn] = await this.create(
      [
        {
          name: foundType.name,
          belongType: foundType._id,
          position,
          defaultValues: createdNewDefaultValues.map((value) => value._id),
        },
      ],
      { session }
    );

    await boardDoc.updateOne(
      {
        $push: {
          columns: createdNewColumn._id,
        },
      },
      { new: true, session }
    );

    const tasksColumns = await TasksColumns.createTasksColumnsByColumn({
      boardDoc: boardDoc,
      columnDoc: createdNewColumn,
      defaultValues: createdNewDefaultValues,
      position,
      session,
    });

    createdNewColumn.defaultValues = createdNewDefaultValues;
    createdNewColumn.belongType = foundType;

    return {
      createdNewColumn,
      tasksColumns,
    };
  }
);

columnSchema.static(
  'createNewColumns',
  async function createNewColumns({
    boardId,
    userId,
    session,
  }: ICreateNewColumns): Promise<ICreateNewColumnsResult> {
    const findingStatusType = Type.findOne({ name: MultipleValueTypes.STATUS });
    const findingDateType = Type.findOne({ name: SingleValueTypes.DATE });
    const foundTypes = await Promise.all([findingStatusType, findingDateType]);

    const newColumnObjs: IColumn[] = [];
    const selectedDefaultValue: IDefaultValueDoc[] = [];
    for (const [index, type] of foundTypes.entries()) {
      const createdNewDefaultValues = await DefaultValue.createNewDefaultValuesByColumn({
        boardId: new Types.ObjectId(boardId),
        typeDoc: type!,
        createdBy: userId,
        session,
      });
      if (createdNewDefaultValues.length === 0) {
        selectedDefaultValue.push(null);
      } else {
        selectedDefaultValue.push(createdNewDefaultValues.at(-1)!);
      }

      newColumnObjs.push({
        name: type!.name,
        position: index,
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

    const gotDefaultValuesFromColumns = await Promise.all(gettingDefaultValuesFromColPromises);

    console.log({ gotDefaultValuesFromColumns });

    return {
      createdNewColumns: gotDefaultValuesFromColumns,
      selectedDefaultValues: selectedDefaultValue,
    };
  }
);

columnSchema.static(
  'updateAllColumns',
  async function updateAllColumns({
    columns,
    session,
  }: IUpdateAllColumns): Promise<NonNullable<IColumnDoc>[]> {
    const changedPositions: number[] = [];
    const desiredPositions: number[] = [];
    const updatingAllColumnPromises = columns.map((column, index) => {
      if (!validator.isMongoId(column._id))
        throw new BadRequestError(`Column Id: ${column._id} is invalid`);

      if (index !== column.position) {
        changedPositions.push(column.position);
        desiredPositions.push(index);
      }
      return this.findByIdAndUpdatePosition({ columnId: column._id, position: index, session });
    });

    if (changedPositions.length === 0) throw new BadRequestError(`Position of columns is the same`);
    const updatedAllColumns = await Promise.all(updatingAllColumnPromises);

    const foundAllTasksColumns = await TasksColumns.find(
      {
        belongColumn: { $in: updatedAllColumns[0]!._id },
      },
      {},
      { session }
    );

    const updatingValuesInTaskPromises = foundAllTasksColumns.map((tasksColumns) =>
      Task.updateAllPositionsInValue({
        changedPositions,
        desiredPositions,
        taskId: tasksColumns.belongTask,
        session,
      })
    );

    await Promise.all(updatingValuesInTaskPromises);
    return updatedAllColumns;
  }
);

columnSchema.static(
  'deleteColumn',
  async function deleteColumn({ boardDoc, columnId, session }: IDeleteColumn) {
    const deletedColumn = await this.findByIdAndDelete(columnId, { session });
    if (!deletedColumn) throw new NotFoundError('Column is not found');

    await boardDoc.updateOne(
      {
        $pull: {
          columns: deletedColumn._id,
        },
      },
      { session }
    );

    const foundAllColumnsInBoard = await this.find(
      {
        _id: { $in: boardDoc.columns },
      },
      {},
      { session }
    ).sort({ position: 1 });

    const slicedColumns = foundAllColumnsInBoard.slice(deletedColumn.position);

    const updatingPositionAllColumnsPromises = slicedColumns.map((column, index) =>
      column.updateOne(
        {
          $set: {
            position: deletedColumn.position + index,
          },
        },
        { session }
      )
    );

    // Delete all default values of this column
    const deleteingDefaultValuesOfColumnPromise = DefaultValue.deleteMany(
      { _id: { $in: deletedColumn.defaultValues } },
      { session }
    );

    // Delete all values in this column
    const findingTasksColumnsPromise = TasksColumns.find(
      {
        belongColumn: { $in: deletedColumn._id },
      },
      {},
      { session }
    );

    const [foundTasksColumns] = await Promise.all([
      findingTasksColumnsPromise,
      deleteingDefaultValuesOfColumnPromise,
      ...updatingPositionAllColumnsPromises,
    ]);

    // Remove all tasksColumn id away from task
    const deleteingTasksColumnsPromises = foundTasksColumns.map((tasksColumns) =>
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
