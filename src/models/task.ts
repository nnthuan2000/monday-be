import { Schema } from 'mongoose';
import {
  ICreateNewTasks,
  IDeleteTask,
  ITask,
  ITaskDoc,
  ITaskMethods,
  TaskModel,
} from '../07-task/interfaces/task';
import db from '../root/db';
import Group from './group';
import { BadRequestError } from '../root/responseHandler/error.response';
import DefaultValue from './defaultValue';
import { createSetOfTasksColumns } from '../root/utils';

const DOCUMENT_NAME = 'Task';
const COLLECTION_NAME = 'Tasks';

// Declare the Schema of the Mongo model
var taskSchema = new Schema<ITask, TaskModel, ITaskMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    values: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'TasksColumns',
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
  async function createNewTasks({ groupId, data, columns, session }: ICreateNewTasks) {
    // Get all values default of these columns
    const findingDefaulValuePromises = columns.map((column) =>
      DefaultValue.findOne({ belongType: column.belongType }, {}, { session }).select(
        '_id value color'
      )
    );

    const foundDefaultValues = await Promise.all(findingDefaulValuePromises);

    let createdNewTasks: NonNullable<ITaskDoc>[];
    if (groupId) {
      createdNewTasks = await this.create([{ ...data }], { session });
      await Group.findByIdAndUpdate(
        groupId,
        {
          $push: {
            tasks: createdNewTasks[0]._id,
          },
        },
        { session }
      );
      return {
        createdNewTasks,
        defaultValues: foundDefaultValues,
      };
    } else {
      const taskObjs: ITask[] = [
        { name: 'Task 1', position: 1, values: [] },
        { name: 'Task 2', position: 2, values: [] },
        { name: 'Task 1', position: 1, values: [] },
        { name: 'Task 2', position: 2, values: [] },
      ];

      for (const task of taskObjs) {
        task.values = await createSetOfTasksColumns(foundDefaultValues, columns, session);
      }

      createdNewTasks = await this.insertMany(taskObjs, { session });
    }
    return { createdNewTasks };
  }
);

taskSchema.static(
  'deleteTask',
  async function deleteTask({ groupId, taskId, session }: IDeleteTask) {
    const deletedTask = await this.findByIdAndDelete(taskId, { session });
    if (!deletedTask) throw new BadRequestError('Task is not found');

    if (groupId) {
      const updatedGroup = await Group.findByIdAndUpdate(groupId, {
        $pull: {
          tasks: deletedTask._id,
        },
      });
      if (!updatedGroup) throw new BadRequestError('Group is not found');
    }
  }
);

//Export the model
const Task = db.model<ITask, TaskModel>(DOCUMENT_NAME, taskSchema);
export default Task;
