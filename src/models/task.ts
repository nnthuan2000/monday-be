import { Schema } from 'mongoose';
import {
  ICreateNewTask,
  ICreateNewTasks,
  IDeleteTask,
  ITask,
  ITaskDoc,
  ITaskMethods,
  IUpdateAllPositionsInValue,
  TaskModel,
} from '../07-task/interfaces/task';
import db from '../root/db';
import Group from './group';
import { BadRequestError } from '../root/responseHandler/error.response';
import { createSetOfTasksColumnsByTask, createSetOfTasksColumnsByTask1 } from '../root/utils';
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
  'createNewTask',
  async function createNewTask({ groupId, data, columns, session }: ICreateNewTask) {
    const [createdNewTask] = await this.create([{ ...data }], { session });

    const updatedTask = await createSetOfTasksColumnsByTask({
      columns: columns,
      taskDoc: createdNewTask,
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
  }
);

taskSchema.static(
  'updateAllPositionsInValue',
  async function updateAllColumn({
    changedPositions,
    desiredPositions,
    taskId,
    session,
  }: IUpdateAllPositionsInValue) {
    const foundTask = await this.findById(taskId);
    if (!foundTask) throw new BadRequestError('Task is not found');
    const values = foundTask.values;
    const changedPositionValues = changedPositions.map((position) => values[position]);
    desiredPositions.forEach((position, index) => {
      values[position] = changedPositionValues[index];
    });

    await foundTask.updateOne(
      {
        $set: {
          values: values,
        },
      },
      { session }
    );
  }
);

taskSchema.static(
  'createNewTasks',
  async function createNewTasks({ columns, selectedDefaultValues, session }: ICreateNewTasks) {
    // Get all values default of these columns

    const taskObjs: ITask[] = [
      { name: 'Task 1', position: 0, values: [] },
      { name: 'Task 2', position: 1, values: [] },
      { name: 'Task 1', position: 0, values: [] },
      { name: 'Task 2', position: 1, values: [] },
    ];

    const createdInsertTasks = (await this.insertMany(taskObjs, {
      session,
    })) as NonNullable<ITaskDoc>[];
    const updatingCreatedTasks = createdInsertTasks.map((task) =>
      createSetOfTasksColumnsByTask1({
        selectedDefaultValues,
        columns,
        taskDoc: task,
        session,
      })
    );

    const createdNewTasks = await Promise.all(updatingCreatedTasks);

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
