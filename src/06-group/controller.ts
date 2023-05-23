import { IControllerWithoutGet, IRequestWithAuth } from '../root/app.interfaces';
import { CREATED, OK } from '../root/responseHandler/success.response';
import { Fn, catchAsync } from '../root/utils/catchAsync';
import GroupService from './service';

class GroupController<T extends IRequestWithAuth> implements IControllerWithoutGet<T> {
  createOne: Fn<T> = catchAsync(async (req, res, next) => {
    const createdNewGroup = await GroupService.createGroup({
      boardId: req.params.boardId,
      groupIds: req.body.groupIds,
      data: req.body.data,
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
    const updatedAllGroups = await GroupService.updateAllGroups({
      groupIds: req.body.groupIds,
    });
    new OK({
      message: 'Update all groups successfully',
      metadata: {
        groups: updatedAllGroups,
      },
    });
  });

  deleteOne: Fn<T> = catchAsync(async (req, res, next) => {
    await GroupService.deleteGroup({
      boardId: req.params.boardId,
      groupId: req.params.id,
      groupIds: req.body.groupIds,
    });
    new OK({
      message: 'Delete group successfully',
      metadata: null,
    }).send(res);
  });
}

export const groupController = new GroupController();
export default groupController;
