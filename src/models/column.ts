import { Schema } from 'mongoose';

import {
  ColumnModel,
  IColumn,
  IColumnDoc,
  IColumnMethods,
  ICreateNewColumns,
  IDeleteColumn,
} from '../05-column/interfaces/column';
import db from '../root/db';
import Type from './type';
import { MultipleValueTypes, SingleValueTypes } from '../05-column/constant';
import Board from './board';
import { BadRequestError } from '../root/responseHandler/error.response';

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
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

columnSchema.static(
  'createNewColumns',
  async function createNewColumns({
    boardId,
    typeDoc,
    position,
    session,
  }: ICreateNewColumns): Promise<NonNullable<IColumnDoc>[]> {
    let createdNewColumns: NonNullable<IColumnDoc>[];
    if (typeDoc) {
      createdNewColumns = await this.create(
        [
          {
            name: typeDoc.name,
            position: position,
            belongType: typeDoc._id,
          },
        ],
        { session }
      );
    } else {
      const findingStatusType = Type.findOne({ name: MultipleValueTypes.STATUS }).lean();
      const findingDateType = Type.findOne({ name: SingleValueTypes.DATE }).lean();
      const [foundStatusType, foundDateType] = await Promise.all([
        findingStatusType,
        findingDateType,
      ]);
      createdNewColumns = await this.create(
        [
          {
            name: foundStatusType!.name,
            position: 1,
            belongType: foundStatusType!._id,
          },
          {
            name: foundDateType!.name,
            position: 2,
            belongType: foundDateType!._id,
          },
        ],
        { session }
      );
    }

    await Board.findByIdAndUpdate(
      boardId,
      {
        $push: {
          columns: { $each: createdNewColumns.map((column) => column._id) },
        },
      },
      { session }
    );

    return createdNewColumns;
  }
);

columnSchema.static(
  'deleteColumn',
  async function deleteColumn({ boardId, columnId, session }: IDeleteColumn) {
    const deletedColumn = await this.findByIdAndDelete(columnId, { session });
    if (!deletedColumn) throw new BadRequestError('Column is not found');

    await Board.findByIdAndUpdate(
      boardId,
      {
        $pull: {
          columns: deletedColumn._id,
        },
      },
      { session }
    );
    // Delete all values in this column
  }
);

//Export the model
const Column = db.model<IColumn, ColumnModel>(DOCUMENT_NAME, columnSchema);
export default Column;
