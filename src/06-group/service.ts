import { BadRequestError } from '../root/responseHandler/error.response';
import {
  ICreateGroupParams,
  IDeleteGroupParams,
  IUpdateAllGroupsParams,
  IUpdateGroupParams,
} from './interfaces/services';
import { performTransaction } from '../root/utils/performTransaction';
import Group from '../models/group';
import { IGroupDoc, IGroupDocObj } from './interfaces/group';

export default class GroupService {
  static async createGroup({ boardId, groups }: ICreateGroupParams) {
    let createdNewGroup: IGroupDoc;
    const updatingAllGroupsPromises: Promise<IGroupDocObj>[] = [];
    return await performTransaction(async (session) => {
      for (const [index, group] of groups.entries()) {
        if (group._id) {
          const updatingGroupPromise = this.updateGroup({
            groupId: group._id,
            updationData: {
              position: index,
            },
            session,
          });
          updatingAllGroupsPromises.push(updatingGroupPromise);
        } else {
          createdNewGroup = await Group.createNewGroup({ boardId, data: { ...group }, session });
        }
      }
      await Promise.all(updatingAllGroupsPromises);
      if (createdNewGroup) throw new BadRequestError('Missing data to create a new group');

      return createdNewGroup;
    });
  }

  static async updateGroup({ groupId, updationData, session = null }: IUpdateGroupParams) {
    const updatedGroup = await Group.findByIdAndUpdate(groupId, updationData, {
      new: true,
      session,
    }).lean();
    if (!updatedGroup) throw new BadRequestError('Group is not found');
    return updatedGroup;
  }

  static async updateAllGroups({ groups }: IUpdateAllGroupsParams) {
    return await performTransaction(async (session) => {
      return await Group.updateAllPositionGroups({ groups, session });
    });
  }

  static async deleteGroup({ boardId, groupId, groups }: IDeleteGroupParams) {
    return await performTransaction(async (session) => {
      await Group.deleteGroup({ boardId, groupId, session });
      await Group.updateAllPositionGroups({ groups, session });
    });
  }
}
