import { Schema } from 'mongoose';
import {
  GroupModel,
  ICreateNewGroup,
  ICreateNewGroups,
  IDeleteGroup,
  IFindByIdAndUpdatePosition,
  IGroup,
  IGroupDoc,
  IGroupMethods,
  IUpdateAllPositionGroups,
} from '../06-group/interfaces/group';
import db from '../root/db';
import { NotFoundError } from '../root/responseHandler/error.response';
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
    boardDoc,
    data,
    session,
  }: ICreateNewGroup): Promise<NonNullable<IGroupDoc>> {
    const [createdNewGroup] = await this.create([{ ...data }], { session });

    await boardDoc.updateOne(
      {
        $push: {
          groups: createdNewGroup._id,
        },
      },
      { new: true, session }
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
  'findByIdAndUpdatePosition',
  async function findByIdAndUpdatePosition({
    groupId,
    position,
    session,
  }: IFindByIdAndUpdatePosition): Promise<NonNullable<IGroupDoc>> {
    const updatedGroup = await this.findByIdAndUpdate(
      groupId,
      {
        $set: {
          position: position,
        },
      },
      { new: true, session }
    );
    if (!updatedGroup) throw new NotFoundError(`Group with id: ${groupId} is not found`);
    return updatedGroup;
  }
);

groupSchema.static(
  'updateAllPositionGroups',
  async function updateAllPositionGroups({
    groups,
    session,
  }: IUpdateAllPositionGroups): Promise<NonNullable<IGroupDoc>[]> {
    const updatingGroupPromises = groups.map((group, index) =>
      this.findByIdAndUpdatePosition({
        groupId: group._id,
        position: index,
        session,
      })
    );

    return await Promise.all(updatingGroupPromises);
  }
);

groupSchema.static(
  'deleteGroup',
  async function deleteGroup({ boardDoc, groupId, session }: IDeleteGroup) {
    const deletedGroup = await this.findByIdAndDelete(groupId, { session });
    if (!deletedGroup) throw new NotFoundError('Group is not found');

    // Delete all tasks and values of each task in this group
    if (boardDoc) {
      await boardDoc.updateOne(
        {
          $pull: {
            groups: deletedGroup._id,
          },
        },
        { session }
      );
      const foundAllGroupsInBoard = await this.find(
        {
          _id: { $in: boardDoc.groups },
        },
        {},
        { session }
      ).sort({ position: 1 });

      const slicedGroups = foundAllGroupsInBoard.slice(deletedGroup.position);

      const updatingPositionAllGroupsPromises = slicedGroups.map((group, index) =>
        group.updateOne(
          {
            $set: {
              position: deletedGroup.position + index,
            },
          },
          { session }
        )
      );

      await Promise.all(updatingPositionAllGroupsPromises);
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
