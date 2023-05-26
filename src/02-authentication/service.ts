import { Response } from 'express';
import nodemailer from 'nodemailer';
import { config, oAuth2Client } from '../root/configs';
import { BadRequestError } from '../root/responseHandler/error.response';
import { getInfodata } from '../root/utils';
import {
  IGetAndValidateUser,
  IGetMeParams,
  ISendCodeAgain,
  ISendGmail,
  ISendResToClient,
  ISignInParams,
  ISignUpParams,
  IVerfiyCode,
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
    const foundUser = await this.getAndValidateUser({ email, password });

    if (!foundUser.isVerified)
      throw new BadRequestError(`User haven't verify code! Try sign-up again`);

    return this.sendResToClient({ Doc: foundUser, fields: ['_id', 'email', 'userProfile'] }, res);
  }

  static async verifyCode({ email, code }: IVerfiyCode, res: Response) {
    const foundUser = await User.findByEmail({ email });
    if (!foundUser) throw new BadRequestError('User is not found');

    if (foundUser.code !== code) throw new BadRequestError('Code is invalid');

    const isValid = Number(new Date(foundUser.expiresIn)) - Date.now();
    if (isValid < 0) throw new BadRequestError('Code is expired! Please re-sent code again');

    await foundUser.updateOne({
      $set: {
        code: null,
        expiresIn: null,
        isVerified: true,
      },
    });

    await Workspace.create({
      name: 'Main Workspace',
      createdBy: foundUser._id,
      isMain: true,
    });

    return this.sendResToClient({ Doc: foundUser, fields: ['_id', 'email', 'userProfile'] }, res);
  }

  static async sendCodeAgain({ email }: ISendCodeAgain) {
    const foundUser = await User.findByEmail({ email });

    if (!foundUser) throw new BadRequestError('User is not found');

    const { code, codeLifeTimeMinutes, expiresIn } = foundUser.generateCode();

    await foundUser.updateOne({
      $set: {
        code: code,
        expiresIn: expiresIn,
      },
    });

    return this.sendGmail({ email, code, codeLifeTimeMinutes });
  }

  static async signUp({ name, email, password }: ISignUpParams) {
    return await performTransaction(async (session) => {
      //TODO 1: Check if email exist
      let foundUser = await User.findByEmail({ email });

      //TODO 2: If exist => return error
      if (foundUser && foundUser.isVerified)
        throw new BadRequestError('User is already registered');

      if (foundUser && !foundUser.isVerified) {
        await UserProfile.findByIdAndUpdate(
          foundUser.id,
          {
            name,
          },
          { session }
        );

        await foundUser.updateOne(
          {
            $set: {
              password,
              userProfile: {
                name,
              },
            },
          },
          { session }
        );
      }

      if (!foundUser) {
        //TODO 3: Create new User
        const [newUserProfile] = await UserProfile.create([{ name }], { session });

        const [createdNewUser] = await User.create(
          [
            {
              _id: newUserProfile._id,
              email,
              password,
              userProfile: {
                name: newUserProfile.name,
              },
            },
          ],
          { session }
        );
        foundUser = createdNewUser;
      }

      const { code, codeLifeTimeMinutes, expiresIn } = foundUser.generateCode();

      await foundUser.updateOne(
        {
          $set: {
            code: code,
            expiresIn: expiresIn,
          },
        },
        { session }
      );

      await this.sendGmail({ email, code, codeLifeTimeMinutes });
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

  static async sendGmail({ email, code, codeLifeTimeMinutes }: ISendGmail) {
    const accessToken = await oAuth2Client.getAccessToken();
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
        accessToken: accessToken.token?.toString(),
      },
    });

    await transporter.sendMail({
      from: '"Monday" <nnthuan2000@gmail.com', // sender address
      to: email, // list of receivers
      subject: 'Verify your email ✔', // Subject line
      text: 'Hello world?', // plain text body
      html: `<p>Your code: <b>${code}</b><br/>This email is only valid for ${codeLifeTimeMinutes} minutes</p>`, // html body
    });
  }

  static async getAndValidateUser({ email, password }: IGetAndValidateUser) {
    const foundUser = await User.findByEmail({ email });
    if (!foundUser) throw new BadRequestError('User is not registerd');

    const isCorrectPassword = foundUser.isMatchPassword(password);
    if (!isCorrectPassword) throw new BadRequestError('User is not registered');
    return foundUser;
  }
}
