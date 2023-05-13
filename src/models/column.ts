import { Schema } from 'mongoose';

import {
  ColumnModel,
  IColumn,
  IColumnMethods,
  ICreateNewColumns,
  IDeleteAllColumns,
} from '../05-column/interfaces/column';
import db from '../root/db';

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
  async function createNewColumns({ boardId, session }: ICreateNewColumns) {
    // const foundStatusType = await Type.findOne({ name: MultipleValueTypes.STATUS }).lean();
    // const foundDateType = await Type.findOne({ name: SingleValueTypes.DATE }).lean();
  }
);

columnSchema.static(
  'deleteAllColumns',
  async function deleteAllColumns({ boardId, session }: IDeleteAllColumns) {
    // await this.deleteMany({ belongBoard: boardId }, { session });
  }
);

//Export the model
const Column = db.model<IColumn, ColumnModel>(DOCUMENT_NAME, columnSchema);
export default Column;
