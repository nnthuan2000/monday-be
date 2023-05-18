import { Response } from 'express';
import nodemailer from 'nodemailer';
import { config } from '../root/configs';
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

      await User.create(
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

      // const accessToken = await oAuth2Client.getAccessToken();
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        port: 465,
        secure: true,
        auth: {
          type: 'OAUTH2',
          user: 'nnthuan2000@gmail.com',
          clientId: config.email.clientId,
          clientSecret: config.email.clientSecret,
          refreshToken: config.email.refreshToken,
        },
      });

      await transporter.sendMail({
        from: '"Monday" <nnthuan2000@gmail.com', // sender address
        to: 'ngocthuandn2k@gmail.com', // list of receivers
        subject: 'Verify your email ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: `<p>Your code: <b>${'000000'}</b></p>`, // html body
      });
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
