import { Schema } from 'mongoose';
import db from '../root/db';
import {
  ITasksColumns,
  ITasksColumnsMethods,
  TasksColumnsModel,
} from '../08-value/interfaces/tasksColumns';

const DOCUMENT_NAME = 'TasksColumns';
const COLLECTION_NAME = 'TasksColumnss';

// Declare the Schema of the Mongo model
var tasksColumnsSchema = new Schema<ITasksColumns, TasksColumnsModel, ITasksColumnsMethods>(
  {
    value: {
      type: String,
      default: null,
    },
    valueId: {
      type: Schema.Types.ObjectId,
      ref: 'DefaultValue',
      default: null,
    },
    typeOfValue: {
      type: String,
      required: true,
    },
    belongColumn: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
const TasksColumns = db.model<ITasksColumns, TasksColumnsModel>(DOCUMENT_NAME, tasksColumnsSchema);
export default TasksColumns;
