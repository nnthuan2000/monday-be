import { Router } from 'express';
import valueController from './controller';

const valueRouter = Router();

valueRouter
  .route('/values/:id')
  .patch(valueController.updateOne as any)
  .delete(valueController.deleteOne as any);

valueRouter
  .route('/board/:boardId/type/:typeId/values')
  .get(valueController.getAll as any)
  .post(valueController.createOne as any);

valueRouter.patch(
  '/task/:taskId/column/:columnId/tasksColumns/:id',
  valueController.selectValue as any
);

export default valueRouter;
