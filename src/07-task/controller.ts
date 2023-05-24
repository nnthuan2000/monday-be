import { IRequestWithAuth } from '../root/app.interfaces';
import { CREATED, OK } from '../root/responseHandler/success.response';
import { Fn, catchAsync } from '../root/utils/catchAsync';
import { ITaskController } from './interfaces/controller';
import TaskService from './service';

class TaskController<T extends IRequestWithAuth> implements ITaskController<T> {
  getAll: Fn<T> = catchAsync(async (req, res, next) => {});

  getOne: Fn<T> = catchAsync(async (req, res, next) => {
    const foundTask = await TaskService.getTask({
      taskId: req.params.id,
    });

    new OK({
      message: 'Get task successfully',
      metadata: {
        task: foundTask,
      },
    }).send(res);
  });

  createOne: Fn<T> = catchAsync(async (req, res, next) => {
    const createdNewTask = await TaskService.createTask({
      boardId: req.params.boardId,
      groupId: req.params.groupId,
      tasks: req.body.tasks,
    });

    new CREATED({
      message: 'Create a new task successfully',
      metadata: {
        task: createdNewTask,
      },
    }).send(res);
  });

  updateOne: Fn<T> = catchAsync(async (req, res, next) => {
    const updatedTask = await TaskService.updateTask({
      taskId: req.params.id,
      updationData: req.body,
    });
    new OK({
      message: 'Update task successfully',
      metadata: {
        task: updatedTask,
      },
    }).send(res);
  });

  updateAllTasks: Fn<T> = catchAsync(async (req, res, next) => {
    const updatedAllTasks = await TaskService.updateAllTasks({
      groupId: req.params.groupId,
      tasks: req.body.tasks,
    });

    new OK({
      message: 'Update all tasks successfully',
      metadata: {
        tasks: updatedAllTasks,
      },
    }).send(res);
  });

  deleteOne: Fn<T> = catchAsync(async (req, res, next) => {
    await TaskService.deleteTask({
      groupId: req.params.groupId,
      taskId: req.params.id,
      tasks: req.body.tasks,
    });
    new OK({
      message: 'Delete task successfully',
      metadata: null,
    }).send(res);
  });
}

const taskController = new TaskController();
export default taskController;
