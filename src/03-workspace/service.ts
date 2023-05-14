import { BadRequestError } from '../root/responseHandler/error.response';
import { performTransaction } from '../root/utils/performTransaction';
import {
  ICreateWorkspaceParams,
  IDeleteWorkspaceParams,
  IGetAllWorkspacesParams,
  IGetMainWorkspaceParams,
  IGetWorkspaceParams,
  ISearchWorkspaceParams,
  IUpdateWorkspaceParams,
} from './interfaces/services';
import QueryTransform from '../root/utils/queryTransform';
import { IWorkspace } from './interfaces/workspace';
import Workspace from '../models/workspace';

export default class WorkspaceService {
  static async searchWorkspace({ keyString }: ISearchWorkspaceParams) {
    const results = await Workspace.find(
      {
        $text: {
          $search: keyString,
        },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .lean();
    return results;
  }

  static async getMainWorkspace({ fields, userId }: IGetMainWorkspaceParams) {
    return await Workspace.findOne({ isMain: true, createdBy: userId }).select(fields).lean();
  }

  static async getAllWorkspaces({ userId, fields, requestQuery }: IGetAllWorkspacesParams) {
    const findingMainWorkspace = this.getMainWorkspace({
      fields,
      userId,
    });
    const workspaceQuery = new QueryTransform<IWorkspace>(
      Workspace.find({ createdBy: userId, isMain: false }),
      requestQuery
    )
      .filter()
      .sort()
      .limitFields(fields)
      .paginate(true);

    const findingWorkspaces = workspaceQuery.getQuery();
    const [foundMainWorkspace, foundWorkspaces] = await Promise.all([
      findingMainWorkspace,
      findingWorkspaces,
    ]);
    return [foundMainWorkspace, ...foundWorkspaces];
  }

  static async getWorkspace({ workspaceId }: IGetWorkspaceParams) {
    const foundWorkspace = await Workspace.findById(workspaceId)
      .populate({
        path: 'boards',
        select: '_id name isCreatedView belongWorkspace',
        options: {
          sort: { updatedAt: -1 },
          limit: 10,
        },
      })
      .lean();
    if (!foundWorkspace) throw new BadRequestError('Workspace is not found');

    return foundWorkspace;
  }

  static async createWorkspace({ userId, data }: ICreateWorkspaceParams) {
    if (data.isMain) throw new BadRequestError(`Can't not create more main workspace`);
    const createdNewWorkspace = await Workspace.create({ ...data, createdBy: userId._id });

    return createdNewWorkspace;
  }

  static async updateWorkspace({ workspaceId, updationData }: IUpdateWorkspaceParams) {
    if (updationData.isMain) throw new BadRequestError(`Can't modify isMain property`);
    const updatedWorkspace = await Workspace.findByIdAndUpdate(workspaceId, updationData, {
      new: true,
    });
    if (!updatedWorkspace) throw new BadRequestError('Workspace is not found');
    return updatedWorkspace;
  }

  static async deleteWorkspace({ workspaceId }: IDeleteWorkspaceParams) {
    return await performTransaction(async (session) => {
      await Workspace.deleteWorkspace({ workspaceId, session });
    });
  }
}
