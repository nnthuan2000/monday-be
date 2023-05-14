import { Schema } from 'mongoose';
import {
  IDeleteWorkspace,
  IWorkspace,
  IWorkspaceMethods,
  WorkspaceModel,
} from '../03-workspace/interfaces/workspace';
import db from '../root/db';
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
    const deletedWorkspace = await this.findByIdAndDelete(workspaceId, { session });
    if (!deletedWorkspace || deletedWorkspace.isMain)
      throw new BadRequestError(
        'Workspace is not found or this workspace is belong main workspace'
      );
  }
);

//Export the model
const Workspace = db.model<IWorkspace, WorkspaceModel>(DOCUMENT_NAME, workspaceSchema);
export default Workspace;
