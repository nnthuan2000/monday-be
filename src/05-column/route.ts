import { Router } from 'express';
import columnController from './controller';

const columnRouter = Router();

columnRouter.get('/column/types', columnController.getAllTypes as any);

columnRouter.post('/board/:boardId/column', columnController.createOne as any);
columnRouter.patch('/allcolumns', columnController.updateAllColumns as any);

columnRouter.delete('/board/:boardId/column/:id', columnController.deleteOne as any);

columnRouter.route('/column/:id').patch(columnController.updateOne as any);

export default columnRouter;
