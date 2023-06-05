import { Request } from 'express';
import { Strategy, StrategyOptions } from 'passport-jwt';
import { PassportStatic } from 'passport';
import User from '../../models/user';
import { Tokens } from '../constant';

const cookieExtractor = function (req: Request) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies[Tokens.ACCESS_TOKEN];
  }
  return token;
};

export const applyPassportStrategy = (passport: PassportStatic) => {
  const options: StrategyOptions = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.SECRET_KEY!,
  };
  passport.use(
    new Strategy(options, async (payload, done) => {
      try {
        const foundUser = await User.findById(payload.userId);
        if (!foundUser) return done(null, false);
        return done(null, foundUser);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
