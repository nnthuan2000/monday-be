import { Schema } from 'mongoose';
import db from '../root/db';
import {
  ICreateTasksColumnsByColumn,
  ITasksColumns,
  ITasksColumnsMethods,
  TasksColumnsModel,
} from '../08-value/interfaces/tasksColumns';
import { ITaskDoc } from '../07-task/interfaces/task';
import { createSetOfTasksColumnsByColumn } from '../root/utils';
import { performTransaction } from '../root/utils/performTransaction';

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

tasksColumnsSchema.static(
  'createTasksColumnsByColumn',
  async function createTasksColumnsByColumn({
    boardDoc,
    columnDoc,
    defaultValue,
  }: ICreateTasksColumnsByColumn) {
    const boardWithGroups = await boardDoc.populate({
      path: 'groups',
      populate: {
        path: 'tasks',
      },
    });

    const tasks = boardWithGroups.groups.reduce(
      (currTasks: NonNullable<ITaskDoc>[], group: any) => {
        currTasks.push(...group.tasks);
        return currTasks;
      },
      []
    );

    return await performTransaction(async (session) => {
      const updatingTaskPromises = tasks.map((task) =>
        createSetOfTasksColumnsByColumn({
          columnId: columnDoc._id,
          defaultValue,
          taskDoc: task,
          typeOfValue: defaultValue ? 'multiple' : 'single',
          session,
        })
      );

      const tasksColumns = await Promise.all(updatingTaskPromises);
      return tasksColumns;
    });
  }
);

//Export the model
const TasksColumns = db.model<ITasksColumns, TasksColumnsModel>(DOCUMENT_NAME, tasksColumnsSchema);
export default TasksColumns;
