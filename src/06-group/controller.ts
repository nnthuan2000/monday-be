import { IRequestWithAuth } from '../root/app.interfaces';
import { BadRequestError } from '../root/responseHandler/error.response';
import { CREATED, OK } from '../root/responseHandler/success.response';
import { Fn, catchAsync } from '../root/utils/catchAsync';
import { IGroupController } from './interfaces/controller';
import GroupService from './service';

class GroupController<T extends IRequestWithAuth> implements IGroupController<T> {
  createOne: Fn<T> = catchAsync(async (req, res, next) => {
    const createdNewGroup = await GroupService.createGroup({
      boardId: req.params.boardId,
      data: req.body,
    });

    new CREATED({
      message: 'Create a new group successfully',
      metadata: {
        group: createdNewGroup,
      },
    }).send(res);
  });

  updateOne: Fn<T> = catchAsync(async (req, res, next) => {
    const updatedGroup = await GroupService.updateGroup({
      groupId: req.params.id,
      updationData: req.body,
    });

    new OK({
      message: 'Update group successfully',
      metadata: {
        group: updatedGroup,
      },
    }).send(res);
  });

  updateAllGroups: Fn<T> = catchAsync(async (req, res, next) => {
    const { groups } = req.body;
    if (!groups) throw new BadRequestError('Invalid transmitted data');
    const updatedAllGroups = await GroupService.updateAllGroups({
      boardId: req.params.boardId,
      groups,
    });
    new OK({
      message: 'Update all groups successfully',
      metadata: {
        groups: updatedAllGroups,
      },
    }).send(res);
  });

  deleteOne: Fn<T> = catchAsync(async (req, res, next) => {
    await GroupService.deleteGroup({
      boardId: req.params.boardId,
      groupId: req.params.id,
    });
    new OK({
      message: 'Delete group successfully',
      metadata: null,
    }).send(res);
  });
}

export const groupController = new GroupController();
export default groupController;
