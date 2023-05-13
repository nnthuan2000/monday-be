import { Router } from 'express';
import { authenticateV2 } from '../02-authentication/middlewares/authenticate';
import accessController from '../02-authentication/conttoller';
import accessRouter from '../02-authentication/route';

const router = Router();

router.use('/auth', accessRouter);

// router.use(authenticate as any);
router.use(authenticateV2 as any);
router.use('/auth/me', accessController.getMe as any);
router.use('/auth/logout', accessController.logout as any);

export default router;
