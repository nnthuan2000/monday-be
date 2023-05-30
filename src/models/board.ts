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
import { NotFoundError } from '../root/responseHandler/error.response';
import Group from './group';
import { convertToArrObj } from '../root/utils';
import Workspace from './workspace';
import DefaultValue from './defaultValue';

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
    userId,
    data,
    session,
  }: ICreateNewBoard): Promise<ICreateNewBoardResult> {
    const [createdNewBoard] = await this.insertMany(
      [
        {
          ...data,
          belongWorkspace: workspaceDoc._id,
        },
      ],
      { session }
    );

    await workspaceDoc.updateOne(
      {
        $push: {
          boards: createdNewBoard._id,
        },
      },
      { session }
    );

    // Create new 2 columns, 2 groups and each group will create 2 new task with default values of 2 created columns
    const { createdNewColumns, selectedDefaultValues } = await Column.createNewColumns({
      boardId: createdNewBoard._id,
      userId,
      session,
    });

    const createdNewGroups = await Group.createNewGroups({
      columns: createdNewColumns,
      selectedDefaultValues,
      session,
    });

    await createdNewBoard.updateOne({
      $push: {
        columns: { $each: createdNewColumns.map((column) => column._id) },
        groups: { $each: createdNewGroups.map((group) => group._id) },
      },
    });

    return {
      ...createdNewBoard.toObject(),
      columns: convertToArrObj({
        fields: ['_id', 'name', 'position', 'belongType', 'defaultValues'],
        objects: createdNewColumns,
      }),
      groups: convertToArrObj({
        fields: ['_id', 'name', 'position', 'tasks'],
        objects: createdNewGroups,
      }),
    } as ICreateNewBoardResult;
  }
);

boardSchema.static(
  'deleteBoard',
  async function deleteBoard({ workspaceId, boardId, session }: IDeleteBoard) {
    const deletedBoard = await this.findByIdAndDelete(boardId, { session });
    if (!deletedBoard) throw new NotFoundError('Board is not found');

    if (workspaceId) {
      const updatedWorkspace = await Workspace.findByIdAndUpdate(
        workspaceId,
        {
          $pull: {
            boards: deletedBoard._id,
          },
        },
        { session }
      );
      if (!updatedWorkspace) throw new NotFoundError('Workspace is not found');
    }

    // Delete all columns and groups for each board

    const deleteColumnsPromise = Column.deleteMany(
      { _id: { $in: deletedBoard.columns } },
      { session }
    );

    const deleteGroupPromises = deletedBoard.groups.map((groupId) =>
      Group.deleteGroup({ groupId, session })
    );

    const deleteAllDefaultValue = DefaultValue.deleteMany(
      { belongBoard: deletedBoard._id },
      { session }
    );

    await Promise.all([...deleteGroupPromises, deleteColumnsPromise, deleteAllDefaultValue]);
  }
);

//Export the model
const Board = db.model<IBoard, BoardModel>(DOCUMENT_NAME, boardSchema);
export default Board;
