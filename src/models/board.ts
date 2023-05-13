import { Schema } from 'mongoose';
import { BoardModel, IBoard, IBoardMethods, IDeleteAllBoards } from '../04-board/interfaces/board';
import db from '../root/db';

const DOCUMENT_NAME = 'Board';
const COLLECTION_NAME = 'Boards';

// Declare the Schema of the Mongo model
var boardSchema = new Schema<IBoard, BoardModel, IBoardMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isCreatedView: {
      type: Boolean,
    },
    belongWorkspace: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Workspace',
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

boardSchema.index({ name: 'text' });

boardSchema.static(
  'deleteAllBoards',
  async function deleteAllBoards({ workspaceId, session }: IDeleteAllBoards) {}
);

//Export the model
const Board = db.model<IBoard, BoardModel>(DOCUMENT_NAME, boardSchema);
export default Board;
