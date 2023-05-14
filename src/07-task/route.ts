import { Router } from 'express';
import taskController from './controller';
const taskRouter = Router();

taskRouter.post('/group/:groupId/task', taskController.createOne as any);

taskRouter
  .route('/task/:id')
  .get(taskController.getOne as any)
  .patch(taskController.updateOne as any);

taskRouter.delete('/group/:groupId/task/:id', taskController.deleteOne as any);

export default taskRouter;
