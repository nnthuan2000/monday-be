import { Schema } from 'mongoose';
import {
  ICreateNewTasks,
  IDeleteTask,
  ITask,
  ITaskMethods,
  TaskModel,
} from '../07-task/interfaces/task';
import db from '../root/db';

const DOCUMENT_NAME = 'Task';
const COLLECTION_NAME = 'Tasks';

// Declare the Schema of the Mongo model
var taskSchema = new Schema<ITask, TaskModel, ITaskMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    position: {
      type: Number,
      required: true,
    },
    values: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Value',
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

taskSchema.static(
  'createNewTasks',
  async function createNewTasks({ groupId, columns, session }: ICreateNewTasks) {}
);

taskSchema.static('deleteTask', async function deleteTask({ groupId, session }: IDeleteTask) {});

//Export the model
const Task = db.model<ITask, TaskModel>(DOCUMENT_NAME, taskSchema);
export default Task;
