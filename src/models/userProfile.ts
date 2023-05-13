import { Schema } from 'mongoose';
import {
  IUserProfile,
  IUserProfileMethods,
  UserProfileModel,
} from '../01-user/interfaces/userProfile';
import db from '../root/db';

const DOCUMENT_NAME = 'UserProfile';
const COLLECTION_NAME = 'UserProfiles';

// Declare the Schema of the Mongo model
var userProfileSchema = new Schema<IUserProfile, UserProfileModel, IUserProfileMethods>(
  {
    name: {
      type: String,
      required: [true, 'User must have name'],
    },
    title: {
      type: String,
    },
    phone: {
      type: String,
      validate: {
        validator: function (el: string) {
          return el.length === 10;
        },
      },
    },
    birthday: Date,
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
const UserProfile = db.model<IUserProfile, UserProfileModel>(DOCUMENT_NAME, userProfileSchema);
export default UserProfile;
