import { Router } from 'express';
import accessController from './conttoller';
import { authenticateV2 } from './middlewares/authenticate';

const accessRouter = Router();

accessRouter.post('/signin', accessController.signIn as any);
accessRouter.post('/signup', accessController.signUp as any);
accessRouter.post('/verify', accessController.verifyCode as any);
accessRouter.post('/sendCode', accessController.sendCode as any);

accessRouter.use(authenticateV2 as any);

accessRouter.get('/me', accessController.getMe as any);
accessRouter.post('/logout', accessController.logout as any);

export default accessRouter;
