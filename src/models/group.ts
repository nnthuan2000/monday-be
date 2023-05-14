import { Schema } from 'mongoose';
import {
  GroupModel,
  ICreateNewGroups,
  IDeleteGroup,
  IGroup,
  IGroupMethods,
} from '../06-group/interfaces/group';
import db from '../root/db';

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
  async function createNewGroups({ boardId, session = null }: ICreateNewGroups) {
    //Create new 2task and new values of these task with columns
  }
);

groupSchema.static(
  'deleteGroup',
  async function deleteGroup({ boardId, groupId, session = null }: IDeleteGroup) {}
);

//Export the model
const Group = db.model<IGroup, GroupModel>(DOCUMENT_NAME, groupSchema);
export default Group;
