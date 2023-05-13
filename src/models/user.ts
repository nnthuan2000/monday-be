import { Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  IFindByEmailParams,
  IUser,
  IUserMethods,
  Payload,
  UserModel,
} from '../01-user/interfaces/user';
import db from '../root/db';

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'Users';

// Declare the Schema of the Mongo model
var userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate: [validator.isEmail, 'Email is wrong format'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    userProfile: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.method('isMatchPassword', async function isMatchPassword(passwordInputed: string) {
  return await bcrypt.compare(passwordInputed, this.password);
});

userSchema.method('generateTokens', function generateTokens() {
  const payload: Payload = {
    userId: this._id.toString(),
    email: this.email,
  };

  const accessTokenLifeTimeHours = 12;
  const refreshTokenLifeTimeDays = 1;
  const keySecret = process.env.SECRET_KEY!;

  const accessToken = jwt.sign(payload, keySecret, {
    expiresIn: `${accessTokenLifeTimeHours}h`,
  });

  const refreshToken = jwt.sign(payload, keySecret, {
    expiresIn: `${refreshTokenLifeTimeDays}d`,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenLifeTime: (accessTokenLifeTimeHours + 7) * 60 * 60 * 1000,
    refreshTokenLifeTime: (refreshTokenLifeTimeDays + 7 / 24) * 24 * 60 * 60 * 1000,
  };
});

userSchema.static(
  'findByEmail',
  async function findByEmail({
    email,
    selectOptions = {
      email: 1,
      password: 1,
      userProfile: 1,
    },
  }: IFindByEmailParams) {
    return this.findOne({ email }).select(selectOptions);
  }
);

//Export the model
const User = db.model<IUser, UserModel>(DOCUMENT_NAME, userSchema);
export default User;
