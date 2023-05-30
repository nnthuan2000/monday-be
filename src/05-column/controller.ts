import { IRequestWithAuth } from '../root/app.interfaces';
import { BadRequestError } from '../root/responseHandler/error.response';
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
    const { columns } = req.body;
    if (!columns) throw new BadRequestError('Invalid transmitted data');

    const { createdNewColumn, defaultValues, tasksColumnsIds } = await ColumnService.createColumn({
      boardId: req.params.boardId,
      userId: req.user._id,
      columns,
    });
    new CREATED({
      message: 'Create a new column successfully',
      metadata: {
        column: createdNewColumn,
        defaultValues,
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

  updateAllColumns: Fn<T> = catchAsync(async (req, res, next) => {
    const { columns } = req.body;
    if (!columns) throw new BadRequestError('Invalid transmitted data');
    const updatedAllColumns = await ColumnService.updateAllColumns({
      boardId: req.params.boardId,
      columns,
    });
    new OK({
      message: 'Update all columns successfully',
      metadata: {
        columns: updatedAllColumns,
      },
    }).send(res);
  });

  deleteOne: Fn<T> = catchAsync(async (req, res, next) => {
    await ColumnService.deleteColumn({
      columnId: req.params.id,
      boardId: req.params.boardId,
    });
    new OK({
      message: 'Delete a column succesfully',
      metadata: null,
    }).send(res);
  });
}

const columnController = new ColumnController();
export default columnController;
