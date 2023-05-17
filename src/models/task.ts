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
import { createSetOfTasksColumnsByTask } from '../root/utils';
import TasksColumns from './tasksColumns';

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

    let createdNewTasks: ITaskDoc[];
    if (groupId && data) {
      const createdNewTask = await this.create([{ ...data }], { session });

      const updatedTask = await createSetOfTasksColumnsByTask({
        defaultValues: foundDefaultValues,
        columns,
        taskDoc: createdNewTask[0],
        session,
      });

      await Group.findByIdAndUpdate(
        groupId,
        {
          $push: {
            tasks: updatedTask!._id,
          },
        },
        { session }
      );
      return await updatedTask!.populate({
        path: 'values',
        select: '_id value valueId belongColumn typeOfValue',
        populate: {
          path: 'valueId',
          select: '_id value color',
        },
      });
    } else {
      const taskObjs: ITask[] = [
        { name: 'Task 1', position: 1, values: [] },
        { name: 'Task 2', position: 2, values: [] },
        { name: 'Task 1', position: 1, values: [] },
        { name: 'Task 2', position: 2, values: [] },
      ];

      const createdInsertTasks = await this.insertMany(taskObjs, { session });
      const updatingCreatedTasks = createdInsertTasks.map((task) =>
        createSetOfTasksColumnsByTask({
          defaultValues: foundDefaultValues,
          columns,
          taskDoc: task,
          session,
        })
      );

      createdNewTasks = await Promise.all(updatingCreatedTasks);
    }
    return createdNewTasks;
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

    await TasksColumns.deleteMany({ _id: { $in: deletedTask.values } }, { session });
  }
);

//Export the model
const Task = db.model<ITask, TaskModel>(DOCUMENT_NAME, taskSchema);
export default Task;
