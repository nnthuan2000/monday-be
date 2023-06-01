import { Schema } from 'mongoose';
import db from '../root/db';
import {
  ICreateNewTasksColumns,
  ICreateTasksColumnsByColumn,
  IDeleteTasksColumnsByColumn,
  ITasksColumns,
  ITasksColumnsDoc,
  ITasksColumnsMethods,
  TasksColumnsModel,
} from '../08-value/interfaces/tasksColumns';
import { ITaskDoc } from '../07-task/interfaces/task';
import { createSetOfTasksColumnsByColumn } from '../root/utils';
import Task from './task';
import { IGroupDoc } from '../06-group/interfaces/group';

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
  'createNewTasksColumns',
  async function createNewTasksColumns({
    data,
    session,
  }: ICreateNewTasksColumns): Promise<NonNullable<ITasksColumnsDoc>> {
    const [createdNewTasksColumns] = await this.create([{ ...data }], { session });
    return createdNewTasksColumns;
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
      options: {
        sort: { position: 1 },
      },
      populate: {
        path: 'tasks',
        options: {
          sort: { position: 1 },
        },
      },
    });

    // const tasks = (boardWithGroups.groups as NonNullable<IGroupDoc>[]).reduce(
    //   (currTasks: NonNullable<ITaskDoc>[], group) => {
    //     currTasks.push(...(group.tasks as NonNullable<ITaskDoc>[]));
    //     return currTasks;
    //   },
    //   []
    // );

    const tasks = (boardWithGroups.groups as NonNullable<IGroupDoc>[]).flatMap(
      (group) => group.tasks as NonNullable<ITaskDoc>[]
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
