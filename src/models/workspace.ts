import { Schema } from 'mongoose';
import {
  IWorkspace,
  IWorkspaceMethods,
  WorkspaceModel,
} from '../03-workspace/interfaces/workspace';
import db from '../root/db';

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
//Export the model
const Workspace = db.model<IWorkspace, WorkspaceModel>(DOCUMENT_NAME, workspaceSchema);
export default Workspace;
