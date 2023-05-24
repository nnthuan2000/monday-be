import { Schema } from 'mongoose';
import {
  ICreateNewTask,
  ICreateNewTasks,
  IDeleteTask,
  IFindByIdAndUpdatePosition,
  ITask,
  ITaskDoc,
  ITaskMethods,
  IUpdateAllPositionTasks,
  TaskModel,
} from '../07-task/interfaces/task';
import db from '../root/db';
import Group from './group';
import { BadRequestError } from '../root/responseHandler/error.response';

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
  'findByIdAndUpdatePosition',
  async function findByIdAndUpdatePosition({
    taskId,
    position,
    session,
  }: IFindByIdAndUpdatePosition): Promise<NonNullable<ITaskDoc>> {
    const updatedTask = await this.findByIdAndUpdate(
      taskId,
      {
        $set: {
          position: position,
        },
      },
      { session }
    );

    if (!updatedTask) throw new BadRequestError(`Task with ${taskId} is not found`);
    return updatedTask;
  }
);

taskSchema.static(
  'createNewTask',
  async function createNewtAsk({ groupId, data, session }: ICreateNewTask) {
    const [createdNewTask] = await this.create([{ ...data }], { session });
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $push: {
          tasks: createdNewTask._id,
        },
      },
      { session }
    );
    if (!updatedGroup) throw new BadRequestError('Group is not found');
  }
);

taskSchema.static(
  'createNewTasks',
  async function createNewTasks({ groupId, data, columns, session }: ICreateNewTasks) {
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
    } else {
      // Get all values default of these columns
      createdNewTasks = await this.insertMany(
        [
          {
            name: 'Task 1',
            position: 1,
          },
          {
            name: 'Task 2',
            position: 2,
          },
          {
            name: 'Task 1',
            position: 1,
          },
          {
            name: 'Task 2',
            position: 2,
          },
        ],
        { session }
      );
    }
    return createdNewTasks;
  }
);

taskSchema.static(
  'updateAllPositionTasks',
  async function updateAllPositionTasks({ tasks, session }: IUpdateAllPositionTasks) {
    const updatingAllTaskPromises = tasks.map((task, index) =>
      this.findByIdAndUpdatePosition({ taskId: task._id, position: index, session })
    );

    return await Promise.all(updatingAllTaskPromises);
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
