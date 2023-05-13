import { Router } from 'express';
import accessRouter from '../02-authentication/route';

const router = Router();

router.use('/auth', accessRouter);

export default router;
