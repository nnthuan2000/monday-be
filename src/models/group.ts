import { Schema } from 'mongoose';
import {
  GroupModel,
  ICreateNewGroup,
  ICreateNewGroups,
  IDeleteGroup,
  IGroup,
  IGroupDoc,
  IGroupMethods,
} from '../06-group/interfaces/group';
import db from '../root/db';
import Board from './board';
import { BadRequestError } from '../root/responseHandler/error.response';
import Task from './task';

const DOCUMENT_NAME = 'Group';
const COLLECTION_NAME = 'Groups';

// Declare the Schema of the Mongo model
var groupSchema = new Schema<IGroup, GroupModel, IGroupMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    tasks: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Task',
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

groupSchema.static(
  'createNewGroup',
  async function createNewGroup({
    boardId,
    data,
    session,
  }: ICreateNewGroup): Promise<NonNullable<IGroupDoc>> {
    const [createdNewGroup] = await this.create([{ ...data }], { session });
    await Board.findByIdAndUpdate(
      boardId,
      {
        $push: {
          groups: createdNewGroup._id,
        },
      },
      { session }
    );
    return createdNewGroup;
  }
);

groupSchema.static(
  'createNewGroups',
  async function createNewGroups({ columns, selectedDefaultValues, session }: ICreateNewGroups) {
    //Create two new tasks and new values of these task with columns
    let groupObjs: IGroup[] = [];
    const tasksPerGroup = 2;
    const createdNewTasks = await Task.createNewTasks({ columns, selectedDefaultValues, session });

    for (let i = 0; i < createdNewTasks.length; i += tasksPerGroup) {
      const tasksSlice = createdNewTasks.slice(i, i + tasksPerGroup);

      const group: IGroup = {
        name: `New Group`,
        position: i / tasksPerGroup,
        tasks: tasksSlice.map((task) => task._id),
      };

      groupObjs.push(group);
    }

    const createdNewGroups = (await this.insertMany(groupObjs, {
      session,
    })) as NonNullable<IGroupDoc>[];

    const groupPromises = createdNewGroups.map((group) =>
      group.populate({
        path: 'tasks',
        select: '_id name description position values',
        populate: {
          path: 'values',
          select: '_id value valueId typeOfValue belongColumn',
          populate: {
            path: 'valueId',
            select: '_id value color',
          },
        },
      })
    );

    return await Promise.all(groupPromises);
  }
);

groupSchema.static(
  'deleteGroup',
  async function deleteGroup({ boardId, groupId, session }: IDeleteGroup) {
    const deletedGroup = await this.findByIdAndDelete(groupId, { session });
    if (!deletedGroup) throw new BadRequestError('Group is not found');

    // Delete all tasks and values of each task in this group

    if (boardId) {
      const updatedBoard = await Board.findByIdAndUpdate(
        boardId,
        {
          $pull: {
            groups: deletedGroup._id,
          },
        },
        { session }
      );
      if (!updatedBoard) throw new BadRequestError('Board is not found');
      if (updatedBoard.groups.length === 0)
        throw new BadRequestError('Board has to have at least one group');
    }

    const deleteTaskPromises = deletedGroup.tasks.map((task) =>
      Task.deleteTask({ taskId: task._id, session })
    );

    await Promise.all(deleteTaskPromises);
  }
);

//Export the model
const Group = db.model<IGroup, GroupModel>(DOCUMENT_NAME, groupSchema);
export default Group;
