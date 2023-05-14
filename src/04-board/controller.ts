import { IRequestQuery, IRequestWithAuth } from '../root/app.interfaces';
import { CREATED, OK } from '../root/responseHandler/success.response';
import { Fn, catchAsync } from '../root/utils/catchAsync';
import BoardService from './service';
import { IBoardController } from './interfaces/controller';

class BoardController<T extends IRequestWithAuth> implements IBoardController<T> {
  searchBoards: Fn<T> = catchAsync(async (req, res, next) => {
    const foundBoards = await BoardService.searchBoards({ keyString: req.params.keySearch });
    new OK({
      message: 'Search board succesfully',
      metadata: {
        boards: foundBoards,
      },
    }).send(res);
  });

  getAll: Fn<T> = catchAsync(async (req, res, next) => {
    const foundBoards = await BoardService.getAllBoards({
      workspaceId: req.params.workspaceId,
      fields: '_id name belongWorkspace',
      requestQuery: req.query as IRequestQuery,
    });

    new OK({
      message: 'Get boards successfully',
      metadata: {
        boards: foundBoards,
      },
    }).send(res);
  });

  getOne: Fn<T> = catchAsync(async (req, res, next) => {
    const foundBoard = await BoardService.getBoard({ boardId: req.params.id });

    new OK({
      message: 'Get board successfully',
      metadata: {
        board: foundBoard,
      },
    }).send(res);
  });

  createOne: Fn<T> = catchAsync(async (req, res, next) => {
    const createdBoard = await BoardService.createBoard({
      workspaceId: req.params.workspaceId,
      data: req.body,
    });

    new CREATED({
      message: 'Create a new Board successfully',
      metadata: {
        board: createdBoard,
      },
    }).send(res);
  });

  updateOne: Fn<T> = catchAsync(async (req, res, next) => {
    const updatedBoard = await BoardService.updateBoard({
      boardId: req.params.id,
      updationData: req.body,
    });

    new OK({
      message: 'Update board successfully',
      metadata: {
        board: updatedBoard,
      },
    }).send(res);
  });

  deleteOne: Fn<T> = catchAsync(async (req, res, next) => {
    await BoardService.deleteBoard({
      workspaceId: req.params.workspaceId,
      boardId: req.params.id,
    });
    new OK({
      message: 'Delete board successfully',
      metadata: null,
    }).send(res);
  });
}

const boardController = new BoardController();
export default boardController;
