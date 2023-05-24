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
import DefaultValue from './defaultValue';
import { createSetOfTasksColumnsByTask } from '../root/utils';
import TasksColumns from './tasksColumns';
import Board from './board';
import { IColumnDoc } from '../05-column/interfaces/column';

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
  async function createNewtAsk({ boardId, groupId, data, session }: ICreateNewTask) {
    const foundBoard = await Board.findById(boardId)
      .populate({
        path: 'columns',
        select: '_id name belongType position',
        options: {
          sort: { position: 1 },
        },
      })
      .lean();

    if (!foundBoard) throw new BadRequestError('Board is not found');

    const columns = foundBoard.columns as NonNullable<IColumnDoc>[];

    const findingDefaulValuePromises = columns.map((column) =>
      DefaultValue.findOne({ belongType: column.belongType }, {}, { session }).select(
        '_id value color'
      )
    );

    const foundDefaultValues = await Promise.all(findingDefaulValuePromises);
    const [createdNewTask] = await this.create([{ ...data }], { session });

    const updatedTask = await createSetOfTasksColumnsByTask({
      defaultValues: foundDefaultValues,
      columns,
      taskDoc: createdNewTask,
      session,
    });

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
  'createNewTasks',
  async function createNewTasks({ columns, session }: ICreateNewTasks): Promise<ITaskDoc[]> {
    // Get all values default of these columns
    const findingDefaulValuePromises = columns.map((column) =>
      DefaultValue.findOne({ belongType: column.belongType }, {}, { session }).select(
        '_id value color'
      )
    );

    const foundDefaultValues = await Promise.all(findingDefaulValuePromises);

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

    const createdNewTasks = await Promise.all(updatingCreatedTasks);
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

    await TasksColumns.deleteMany({ _id: { $in: deletedTask.values } }, { session });
  }
);

//Export the model
const Task = db.model<ITask, TaskModel>(DOCUMENT_NAME, taskSchema);
export default Task;
