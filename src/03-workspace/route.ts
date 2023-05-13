import { Router } from 'express';
import workspaceController from './controller';

const workspaceRouter = Router();

workspaceRouter
  .route('/workspace')
  .get(workspaceController.getAll as any)
  .post(workspaceController.createOne as any);

workspaceRouter
  .route('/workspace/:id')
  .get(workspaceController.getOne as any)
  .patch(workspaceController.updateOne as any)
  .delete(workspaceController.deleteOne as any);

workspaceRouter.get('/search/:keySearch', workspaceController.searchWorkspace as any);

export default workspaceRouter;
