import { Router } from 'express';
import accessController from './conttoller';

const accessRouter = Router();

accessRouter.post('/signin', accessController.signIn as any);
accessRouter.post('/signup', accessController.signUp as any);
accessRouter.post('/verify', accessController.verifyCode as any);
accessRouter.post('/sendCode', accessController.sendCode as any);

export default accessRouter;
