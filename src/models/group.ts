import { Schema } from 'mongoose';
import {
  GroupModel,
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
  'createNewGroups',
  async function createNewGroups({ boardId, data, columns, session }: ICreateNewGroups) {
    let createdNewGroups: NonNullable<IGroupDoc>[];
    if (data) {
      createdNewGroups = await this.create([{ ...data }], { session });
      await Board.findByIdAndUpdate(
        boardId,
        {
          $push: {
            groups: createdNewGroups[0]._id,
          },
        },
        { session }
      );
    } else {
      //Create two new tasks and new values of these task with columns
      let groupObjs: IGroup[] = [];
      const tasksPerGroup = 2;
      const createdNewTasks = await Task.createNewTasks({ columns, session });

      for (let i = 0; i < createdNewTasks.length; i += tasksPerGroup) {
        const tasksSlice = createdNewTasks.slice(i, i + tasksPerGroup);

        const group: IGroup = {
          name: `New Group`,
          position: i / tasksPerGroup + 1,
          tasks: tasksSlice.map((task) => task._id),
        };

        groupObjs.push(group);
      }

      createdNewGroups = await this.insertMany(groupObjs, { session });
    }

    const groupPromises = createdNewGroups.map((group) =>
      group.populate({
        path: 'tasks',
        select: '_id name position values',
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

    const deleteTaskPromises = deletedGroup.tasks.map((task) =>
      Task.deleteTask({ taskId: task._id, session })
    );

    await Promise.all(deleteTaskPromises);

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
    }
  }
);

//Export the model
const Group = db.model<IGroup, GroupModel>(DOCUMENT_NAME, groupSchema);
export default Group;
