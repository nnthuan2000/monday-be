import jwt from 'jsonwebtoken';
import passport from 'passport';
import { catchAsync } from '../../root/utils/catchAsync';
import { IRequestWithAuth } from '../../root/app.interfaces';
import { AuthFailureError } from '../../root/responseHandler/error.response';
import { IUserDoc, Payload } from '../../01-user/interfaces/user';
import User from '../../models/user';

export const authenticate = catchAsync<IRequestWithAuth>(async (req, res, next) => {
  try {
    //TODO 1: Get accessToken from cookies
    // const accessTokenWithBearer = req.headers[HEADER.AUTHORIZATION] as string;
    // if (!accessTokenWithBearer) throw new AuthFailureError('Invalid request');
    const userId = req.headers['client-id'];
    if (!userId) throw new AuthFailureError(`Id's user is missing in header request`);

    // const accessToken = accessTokenWithBearer.split(' ')[1];
    // if (!accessToken) throw new AuthFailureError('Invalid request');

    const { accessToken } = req.cookies;
    if (!accessToken) throw new AuthFailureError('Invalid request');

    //TODO 2: Decode token
    const decoded = jwt.verify(accessToken, process.env.SECRET_KEY!) as Payload;

    if (decoded.userId !== userId) throw new AuthFailureError('Invalid userId');

    const foundUser = await User.findById(decoded.userId);
    if (!foundUser)
      throw new AuthFailureError('This User is not belong token! Please log in again');

    if (!foundUser.isVerified)
      throw new AuthFailureError(`This account have't verify code! Please sign-up again`);

    req.user = foundUser;

    return next();
  } catch (err) {
    const error = err as Error;
    switch (error.name) {
      case 'TokenExpiredError':
        throw new AuthFailureError('Token has expired');
      case 'NotBeforeError':
        throw new AuthFailureError('Token is not yet valid');
      case 'JsonWebTokenError':
        throw new AuthFailureError('Token is invalid');
      default:
        throw err;
    }
  }
});

export const authenticateV2 = catchAsync<IRequestWithAuth>(async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, function (err: Error, user: IUserDoc) {
    if (err) return next(err);

    if (!user)
      throw new AuthFailureError('This user is not belong this token! Please log in again');

    const userId = req.headers['client-id'];
    if (!userId) throw new AuthFailureError(`Id's user is missing in header request`);
    if (user._id.toString() !== userId) throw new AuthFailureError('Invalid userId');

    req.user = user;
    next();
  })(req, res, next);
});
