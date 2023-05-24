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
import Board from './board';
import { BadRequestError } from '../root/responseHandler/error.response';

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

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      {
        $push: {
          groups: createdNewGroup._id,
        },
      },
      { session }
    );
    if (!updatedBoard) throw new BadRequestError('Board is not found');
    return createdNewGroup;
  }
);

groupSchema.static(
  'createNewGroups',
  async function createNewGroups({
    boardId,
    data,
    columns,
    session,
  }: ICreateNewGroups): Promise<NonNullable<IGroupDoc>[]> {
    const createdNewGroups = await this.create(
      [
        {
          name: 'New Group',
          position: 1,
        },
        {
          name: 'New Group',
          position: 2,
        },
      ],
      { session }
    );
    //Create two new tasks and new values of these task with columns

    return createdNewGroups;
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
      { session }
    );
    if (!updatedGroup) throw new BadRequestError(`Group with id: ${groupId} is not found`);
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
  async function deleteGroup({ boardId, groupId, session }: IDeleteGroup) {
    const deletedGroup = await this.findByIdAndDelete(groupId, { session });
    if (!deletedGroup) throw new BadRequestError('Group is not found');

    // Delete all tasks and values of each task in this group

    if (boardId) {
      await Board.findByIdAndUpdate(
        boardId,
        {
          $pull: {
            groups: deletedGroup._id,
          },
        },
        { session }
      );
    }
  }
);

//Export the model
const Group = db.model<IGroup, GroupModel>(DOCUMENT_NAME, groupSchema);
export default Group;
