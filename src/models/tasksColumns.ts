import { Schema } from 'mongoose';
import db from '../root/db';
import {
  ICreateTasksColumnsByColumn,
  IDeleteTasksColumnsByColumn,
  ITasksColumns,
  ITasksColumnsMethods,
  TasksColumnsModel,
} from '../08-value/interfaces/tasksColumns';
import { ITaskDoc } from '../07-task/interfaces/task';
import { createSetOfTasksColumnsByColumn } from '../root/utils';
import Task from './task';

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
    belongTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
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
    defaultValues,
    position,
    session,
  }: ICreateTasksColumnsByColumn) {
    const boardWithGroups = await boardDoc.populate({
      path: 'groups',
      populate: {
        path: 'tasks',
        options: {
          sort: { position: 1 },
        },
      },
    });

    const tasks = boardWithGroups.groups.reduce(
      (currTasks: NonNullable<ITaskDoc>[], group: any) => {
        currTasks.push(...group.tasks);
        return currTasks;
      },
      []
    );

    const updatingTaskPromises = tasks.map((task) =>
      createSetOfTasksColumnsByColumn({
        columnId: columnDoc._id,
        defaultValue: defaultValues.at(-1)!,
        taskDoc: task,
        position,
        typeOfValue: defaultValues.length !== 0 ? 'multiple' : 'single',
        session,
      })
    );

    const tasksColumns = await Promise.all(updatingTaskPromises);
    return tasksColumns;
  }
);

tasksColumnsSchema.static(
  'deleteTasksColumnsByColumn',
  async function deleteTasksColumnsByColumn({ tasksColumnsDoc }: IDeleteTasksColumnsByColumn) {
    await Task.findByIdAndUpdate(tasksColumnsDoc.belongTask, {
      $pull: {
        values: tasksColumnsDoc._id,
      },
    });

    await tasksColumnsDoc.deleteOne();
  }
);

//Export the model
const TasksColumns = db.model<ITasksColumns, TasksColumnsModel>(DOCUMENT_NAME, tasksColumnsSchema);
export default TasksColumns;
