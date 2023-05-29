import { Router } from 'express';
import { authenticateV2 } from '../02-authentication/middlewares/authenticate';
import accessRouter from '../02-authentication/route';
import accessController from '../02-authentication/conttoller';

const router = Router();

router.use('/auth', accessRouter);

// router.use(authenticate as any);
router.use(authenticateV2 as any);

accessRouter.get('/me', accessController.getMe as any);
accessRouter.post('/logout', accessController.logout as any);

export default router;
