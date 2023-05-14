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
      createdNewGroups = await this.create(
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
    }

    return createdNewGroups;
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
