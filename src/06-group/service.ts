import { BadRequestError } from '../root/responseHandler/error.response';
import {
  ICreateGroupParams,
  IDeleteGroupParams,
  IUpdateAllGroupsParams,
  IUpdateGroupParams,
} from './interfaces/services';
import { performTransaction } from '../root/utils/performTransaction';
import Group from '../models/group';

export default class GroupService {
  static async createGroup({ boardId, data, groupIds }: ICreateGroupParams) {
    return await performTransaction(async (session) => {
      const [createdNewGroup] = await Group.createNewGroups({ boardId, data, session });

      await this.updateAllGroups({ groupIds, session });

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

  static async updateAllGroups({ groupIds, session }: IUpdateAllGroupsParams) {
    if (!session) {
      return await performTransaction(async (session) => {
        const updatingAllGroupsPromises = groupIds.map((groupId, index) =>
          this.updateGroup({
            groupId,
            updationData: {
              position: index + 1,
            },
            session,
          })
        );

        const updatedAllGroups = await Promise.all(updatingAllGroupsPromises);
        return updatedAllGroups;
      });
    } else {
      const updatingAllGroupsPromises = groupIds.map((groupId, index) =>
        this.updateGroup({
          groupId,
          updationData: {
            position: index + 1,
          },
          session,
        })
      );

      await Promise.all(updatingAllGroupsPromises);
    }
  }

  static async deleteGroup({ boardId, groupId, groupIds }: IDeleteGroupParams) {
    return await performTransaction(async (session) => {
      await this.updateAllGroups({ groupIds, session });
      return Group.deleteGroup({ boardId, groupId, session });
    });
  }
}
