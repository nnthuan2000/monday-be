import { IRequestWithAuth } from '../root/app.interfaces';
import { BadRequestError } from '../root/responseHandler/error.response';
import { CREATED, OK } from '../root/responseHandler/success.response';
import { Fn, catchAsync } from '../root/utils/catchAsync';
import { IAccessController } from './interfaces/controller';
import AccessService from './service';

class AcessController<T extends IRequestWithAuth> implements IAccessController<T> {
  logout: Fn<T> = catchAsync(async (req, res, next) => {
    new OK({
      message: 'Log out successfully',
      metadata: AccessService.logout(res),
    }).send(res);
  });

  signIn: Fn<T> = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) throw new BadRequestError('Missing some fields');
    new OK({
      message: 'Sign in successfully',
      metadata: await AccessService.signIn({ email, password }, res),
    }).send(res);
  });

  verifyCode: Fn<T> = catchAsync(async (req, res, next) => {
    const { email, password, code } = req.body;
    if (!email || !password || !code) throw new BadRequestError('Missing some fields');

    new CREATED({
      message: 'Verify account successfully',
      metadata: await AccessService.verifyCode({ email, password, code }, res),
    }).send(res);
  });

  sendCode: Fn<T> = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) throw new BadRequestError('Missing some fields');
    new OK({
      message: 'Send code again successfully',
      metadata: await AccessService.sendCodeAgain({ email, password }),
    }).send(res);
  });

  signUp: Fn<T> = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new BadRequestError('Missing some fields');
    new OK({
      message: 'Check code in your gmail',
      metadata: await AccessService.signUp({ name, email, password }),
    }).send(res);
  });

  getMe: Fn<T> = catchAsync(async (req, res, next) => {
    new OK({
      message: 'Get information successfully',
      metadata: await AccessService.getMe({ id: req.user._id }, res),
    }).send(res);
  });
}

const accessController = new AcessController<IRequestWithAuth>();
export default accessController;
