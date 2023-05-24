import { Router } from 'express';
import groupController from './controller';

const groupRouter = Router();

groupRouter.post('/board/:boardId/group', groupController.createOne as any);

groupRouter.patch('/group/:id', groupController.updateOne as any);
groupRouter.patch('/board/:boardId/allgroups', groupController.updateAllGroups as any);

groupRouter.delete('/board/:boardId/group/:id', groupController.deleteOne as any);

export default groupRouter;
