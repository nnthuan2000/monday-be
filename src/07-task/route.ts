import { Router } from 'express';
import taskController from './controller';
const taskRouter = Router();

taskRouter.post('/board/:boardId/group/:groupId/task', taskController.createOne as any);

taskRouter
  .route('/task/:id')
  .get(taskController.getOne as any)
  .patch(taskController.updateOne as any);

taskRouter
  .route('/group/:groupId/tasks')
  .patch(taskController.updateAllTasks as any)
  .delete(taskController.deleteTasks as any);

taskRouter.delete('/group/:groupId/alltasks', taskController.deleteAllTasksInGroup as any);

export default taskRouter;
