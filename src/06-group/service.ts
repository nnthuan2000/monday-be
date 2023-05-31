import { BadRequestError, NotFoundError } from '../root/responseHandler/error.response';
import {
  ICreateGroupParams,
  IDeleteGroupParams,
  IUpdateAllGroupsParams,
  IUpdateGroupParams,
} from './interfaces/services';
import { performTransaction } from '../root/utils/performTransaction';
import Group from '../models/group';
import Board from '../models/board';
import { IGroupDoc } from './interfaces/group';

export default class GroupService {
  static async createGroup({ boardId, data }: ICreateGroupParams) {
    const insertPosition = data.position;
    return await performTransaction(async (session) => {
      const foundBoardWithGroups = await Board.findById(boardId, {}, { session }).populate({
        path: 'groups',
        select: '_id position',
        options: {
          sort: { position: 1 },
        },
      });

      if (!foundBoardWithGroups) throw new NotFoundError('Board is not found');

      if (insertPosition > foundBoardWithGroups.groups.length)
        throw new BadRequestError(`Invalid position ${insertPosition} to create a new group`);

      let updatingGroupPromises: any = [];
      const slicedGroup = foundBoardWithGroups.groups.slice(insertPosition);
      if (slicedGroup.length !== 0) {
        updatingGroupPromises = slicedGroup.map((group, index) => {
          return (group as NonNullable<IGroupDoc>).updateOne(
            {
              $set: {
                position: insertPosition + index + 1,
              },
            },
            { new: true, session }
          );
        });
      }

      const creatingNewGroupPromise = Group.createNewGroup({
        boardDoc: foundBoardWithGroups,
        data,
        session,
      });

      updatingGroupPromises.unshift(creatingNewGroupPromise);

      const [createdNewGroup] = await Promise.all(updatingGroupPromises);
      return createdNewGroup;
    });
  }

  static async updateGroup({ groupId, updationData, session = null }: IUpdateGroupParams) {
    if (updationData.position) throw new BadRequestError(`Can't modify position of group`);
    const updatedGroup = await Group.findByIdAndUpdate(groupId, updationData, {
      new: true,
      session,
    }).lean();
    if (!updatedGroup) throw new NotFoundError('Group is not found');
    return updatedGroup;
  }

  static async updateAllGroups({ boardId, groups }: IUpdateAllGroupsParams) {
    const foundBoard = await Board.findById(boardId).lean();

    if (!foundBoard) throw new NotFoundError('Board is not found');

    if (foundBoard.groups.length !== groups.length)
      throw new BadRequestError(
        'Please send all groups in a board to update all position of groups'
      );

    const totalNumOfGroups = groups.length;
    const totalDesiredPosition = (totalNumOfGroups * (0 + totalNumOfGroups - 1)) / 2;
    const totalPosition = groups.reduce((currTotal, group) => currTotal + group.position, 0);

    if (totalDesiredPosition !== totalPosition)
      throw new BadRequestError('Something wrong when transmitted position of groups');

    return await performTransaction(async (session) => {
      return await Group.updateAllPositionGroups({ groups, session });
    });
  }

  static async deleteGroup({ boardId, groupId }: IDeleteGroupParams) {
    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) throw new NotFoundError('Board is not found');

    if (foundBoard.groups.length === 1)
      throw new BadRequestError('Board has to have at least one group');

    return await performTransaction(async (session) => {
      await Group.deleteGroup({ boardDoc: foundBoard, groupId, session });
    });
  }
}
