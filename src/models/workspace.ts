import { Schema } from 'mongoose';
import {
  IDeleteWorkspace,
  IWorkspace,
  IWorkspaceMethods,
  WorkspaceModel,
} from '../03-workspace/interfaces/workspace';
import db from '../root/db';
import Board from './board';
import { BadRequestError } from '../root/responseHandler/error.response';

const DOCUMENT_NAME = 'Workspace';
const COLLECTION_NAME = 'Workspaces';

// Declare the Schema of the Mongo model
var workspaceSchema = new Schema<IWorkspace, WorkspaceModel, IWorkspaceMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isMain: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    boards: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Board',
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

workspaceSchema.index({ name: 'text' });

workspaceSchema.static(
  'deleteWorkspace',
  async function deleteWorkspace({ workspaceId, session }: IDeleteWorkspace) {
    const foundWorkspace = await Workspace.findById(workspaceId);
    if (!foundWorkspace) throw new BadRequestError('Workspace is not found');
    if (foundWorkspace.isMain) throw new BadRequestError(`This main workspace cant not deleted`);

    // Delete all boards
    const boardIds = foundWorkspace.boards;
    const deleteBoardPromises = boardIds.map((boardId) => Board.deleteBoard({ boardId, session }));
    await Promise.all(deleteBoardPromises);
  }
);

//Export the model
const Workspace = db.model<IWorkspace, WorkspaceModel>(DOCUMENT_NAME, workspaceSchema);
export default Workspace;
