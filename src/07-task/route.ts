import { Router } from 'express';
import taskController from './controller';
const taskRouter = Router();

taskRouter.post('/board/:boardId/group/:groupId/task', taskController.createOne as any);

taskRouter
  .route('/task/:id')
  .get(taskController.getOne as any)
  .patch(taskController.updateOne as any);

taskRouter.delete('/group/:groupId/task/:id', taskController.deleteOne as any);

taskRouter.delete('/group/:groupId/alltasks', taskController.deleteAllTasks as any);

export default taskRouter;
