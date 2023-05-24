import { BadRequestError } from '../root/responseHandler/error.response';
import { ICreateGroupParams, IDeleteGroupParams, IUpdateGroupParams } from './interfaces/services';
import { performTransaction } from '../root/utils/performTransaction';
import Group from '../models/group';

export default class GroupService {
  static async createGroup({ boardId, data }: ICreateGroupParams) {
    return await performTransaction(async (session) => {
      return await Group.createNewGroup({ boardId, data, session });
    });
  }

  static async updateGroup({ groupId, updationData }: IUpdateGroupParams) {
    const updatedGroup = await Group.findByIdAndUpdate(groupId, updationData, { new: true }).lean();
    if (!updatedGroup) throw new BadRequestError('Group is not found');
    return updatedGroup;
  }

  static async deleteGroup({ boardId, groupId }: IDeleteGroupParams) {
    return await performTransaction(async (session) => {
      return Group.deleteGroup({ boardId, groupId, session });
    });
  }
}
