import { IRequestWithAuth } from '../root/app.interfaces';
import { CREATED, OK } from '../root/responseHandler/success.response';
import { Fn, catchAsync } from '../root/utils/catchAsync';
import { IColumnController } from './interfaces/controller';
import ColumnService from './service';

class ColumnController<T extends IRequestWithAuth> implements IColumnController<T> {
  getOne: Fn<T> = catchAsync(async (req, res, next) => {});

  getAllTypes: Fn<T> = catchAsync(async (req, res, next) => {
    const foundAllTypes = await ColumnService.getAllTypes();
    new OK({
      message: 'Get all types successfully',
      metadata: {
        types: foundAllTypes,
      },
    }).send(res);
  });

  createOne: Fn<T> = catchAsync(async (req, res, next) => {
    const { createdNewColumn, defaultValue, tasksColumnsIds } = await ColumnService.createColumn({
      boardId: req.params.boardId,
      ...req.body,
    });
    new CREATED({
      message: 'Create a new column successfully',
      metadata: {
        column: createdNewColumn,
        defaultValue,
        tasksColumnsIds,
      },
    }).send(res);
  });

  updateOne: Fn<T> = catchAsync(async (req, res, next) => {
    const updatedColumn = await ColumnService.updateColumn({
      columnId: req.params.id,
      updationData: req.body,
    });
    new OK({
      message: 'Update column successfully',
      metadata: {
        column: updatedColumn,
      },
    }).send(res);
  });

  deleteOne: Fn<T> = catchAsync(async (req, res, next) => {
    await ColumnService.deleteColumn({ columnId: req.params.id, boardId: req.params.boardId });
    new OK({
      message: 'Delete a column succesfully',
      metadata: null,
    }).send(res);
  });
}

const columnController = new ColumnController();
export default columnController;
