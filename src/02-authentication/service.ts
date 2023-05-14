import { Response } from 'express';
import { BadRequestError } from '../root/responseHandler/error.response';
import { getInfodata } from '../root/utils';
import {
  IGetMeParams,
  ISendResToClient,
  ISignInParams,
  ISignUpParams,
} from './interfaces/services';
import { performTransaction } from '../root/utils/performTransaction';
import { Tokens } from './constant';
import User from '../models/user';
import UserProfile from '../models/userProfile';
import { IUserDoc } from '../01-user/interfaces/user';
import Workspace from '../models/workspace';

export default class AccessService {
  static logout(res: Response) {
    res.clearCookie(Tokens.ACCESS_TOKEN);
    res.clearCookie(Tokens.REFRESH_TOKEN);
    return null;
  }

  static async signIn({ email, password }: ISignInParams, res: Response) {
    //TODO 1: Check email in dbs
    const foundUser = await User.findByEmail({ email });

    if (!foundUser) throw new BadRequestError('User is not registered');

    //TODO 2: Check match password
    const isMatchPassword = await foundUser.isMatchPassword(password);
    if (!isMatchPassword) throw new BadRequestError('Password is not correct');

    return this.sendResToClient({ Doc: foundUser, fields: ['_id', 'email', 'userProfile'] }, res);
  }

  static async signUp({ name, email, password }: ISignUpParams, res: Response) {
    return await performTransaction(async (session) => {
      //TODO 1: Check if email exist
      const foundUser = await User.findByEmail({ email });

      //TODO 2: If exist => return error
      if (foundUser) throw new BadRequestError('User is already registered');

      //TODO 3: Create new User
      const [newUserProfile] = await UserProfile.create([{ name }], { session });

      const [newUser] = await User.create(
        [
          {
            email,
            password,
            userProfile: {
              name: newUserProfile.name,
            },
          },
        ],
        { session }
      );

      await Workspace.create({
        name: 'Main workspace',
        isMain: true,
        createdBy: newUser._id,
      });

      //TODO 4: Create token -> send it to client
      return this.sendResToClient({ Doc: newUser, fields: ['_id', 'email', 'userProfile'] }, res);
    });
  }

  static async getMe({ id }: IGetMeParams, res: Response) {
    const foundUser = await User.findById(id);
    if (!foundUser) throw new BadRequestError('User is not exist');
    return this.sendResToClient<IUserDoc>(
      {
        Doc: foundUser,
        fields: ['_id', 'email', 'userProfile'],
      },
      res
    );
  }

  static sendResToClient<T extends IUserDoc>({ Doc, fields }: ISendResToClient<T>, res: Response) {
    const { accessToken, refreshToken, accessTokenLifeTime, refreshTokenLifeTime } =
      Doc.generateTokens();

    res.cookie(Tokens.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      maxAge: accessTokenLifeTime,
    });

    res.cookie(Tokens.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      maxAge: refreshTokenLifeTime,
    });

    return {
      user: getInfodata({
        fields,
        object: Doc,
      }),
    };
  }
}
