import { IRequestQuery, IRequestWithAuth } from '../root/app.interfaces';
import { CREATED, OK } from '../root/responseHandler/success.response';
import { Fn, catchAsync } from '../root/utils/catchAsync';
import IWorkspaceController from './interfaces/controller';
import WorkspaceService from './service';

class WorkspaceController<T extends IRequestWithAuth> implements IWorkspaceController<T> {
  searchWorkspace: Fn<T> = catchAsync(async (req, res, next) => {
    const searchedWorkspace = await WorkspaceService.searchWorkspace({
      keyString: req.params.keySearch,
    });

    new OK({
      message: 'Search successfully',
      metadata: {
        workspaces: searchedWorkspace,
      },
    }).send(res);
  });

  getAll: Fn<T> = catchAsync(async (req, res, next) => {
    const foundWorkspaces = await WorkspaceService.getAllWorkspaces({
      userId: req.user._id,
      fields: '_id name description isMain',
      requestQuery: req.query as IRequestQuery,
    });
    new OK({
      message: 'Get list workspaces successfully',
      metadata: {
        workspaces: foundWorkspaces,
      },
    }).send(res);
  });

  getOne: Fn<T> = catchAsync(async (req, res, next) => {
    const foundWorkspace = await WorkspaceService.getWorkspace({
      workspaceId: req.params.id,
    });

    new OK({
      message: 'Get workspace successfully',
      metadata: {
        workspace: foundWorkspace,
      },
    }).send(res);
  });

  createOne: Fn<T> = catchAsync(async (req, res, next) => {
    const createdNewWorkspace = await WorkspaceService.createWorkspace({
      userId: req.user._id,
      data: req.body,
    });

    new CREATED({
      message: 'Create a new workspace successfully',
      metadata: {
        workspace: createdNewWorkspace,
      },
    }).send(res);
  });

  updateOne: Fn<T> = catchAsync(async (req, res, next) => {
    const updatedWorkspace = await WorkspaceService.updateWorkspace({
      workspaceId: req.params.id,
      updationData: req.body,
    });

    new OK({
      message: 'Update workspace successfully',
      metadata: {
        workspace: updatedWorkspace,
      },
    }).send(res);
  });

  deleteOne: Fn<T> = catchAsync(async (req, res, next) => {
    await WorkspaceService.deleteWorkspace({ workspaceId: req.params.id });
    new OK({
      message: 'Delete workspace succesfully',
    }).send(res);
  });
}

const workspaceController = new WorkspaceController();
export default workspaceController;
