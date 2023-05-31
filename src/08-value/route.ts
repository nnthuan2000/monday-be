import { Router } from 'express';
import valueController from './controller';

const valueRouter = Router();

valueRouter.patch('/values/:id', valueController.updateOne as any);

valueRouter.delete('/column/:columnId/values/:id', valueController.deleteOne as any);

valueRouter
  .route('/board/:boardId/column/:columnId/values')
  .get(valueController.getAll as any)
  .post(valueController.createOne as any);

valueRouter.patch('/tasksColumns/:id', valueController.selectValue as any);

export default valueRouter;
