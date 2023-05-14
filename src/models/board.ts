import { Schema } from 'mongoose';
import {
  BoardModel,
  IBoard,
  IBoardMethods,
  ICreateNewBoard,
  ICreateNewBoardResult,
  IDeleteBoard,
} from '../04-board/interfaces/board';
import db from '../root/db';
import Column from './column';
import { BadRequestError } from '../root/responseHandler/error.response';

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
    groups: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Group',
        },
      ],
      default: [],
    },
    columns: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Column',
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

boardSchema.index({ name: 'text' });

boardSchema.static(
  'createNewBoard',
  async function createNewBoard({
    workspaceDoc,
    data,
    session,
  }: ICreateNewBoard): Promise<ICreateNewBoardResult> {
    const [createdNewBoard] = await this.create(
      [
        {
          ...data,
          belongWorkspace: workspaceDoc._id,
        },
      ],
      { session }
    );

    await workspaceDoc.updateOne({
      $push: {
        boards: createdNewBoard._id,
      },
    });

    // Create new 2 columns, 2 groups and each group will create 2 new task with default values of 2 created columns
    const createdNewColumns = await Column.createNewColumns({
      boardId: createdNewBoard._id,
      session,
    });

    return {
      ...createdNewBoard.toObject(),
      columns: createdNewColumns,
    } as ICreateNewBoardResult;
  }
);

boardSchema.static('deleteBoard', async function deleteBoard({ boardId, session }: IDeleteBoard) {
  const foundBoard = await this.findById(boardId, {}, { session });
  if (!foundBoard) throw new BadRequestError('Board is not found');

  // Delete all columns and groups for each board
  const deleteColumnPromises = foundBoard.columns.map((columnId) =>
    Column.deleteColumn({ boardId: foundBoard._id, columnId, session })
  );

  await Promise.all(deleteColumnPromises);

  await foundBoard.deleteOne({ session });
});

//Export the model
const Board = db.model<IBoard, BoardModel>(DOCUMENT_NAME, boardSchema);
export default Board;
