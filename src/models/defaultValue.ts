import { Schema } from 'mongoose';
import db from '../root/db';
import {
  DefaultValueModel,
  IDefaultValue,
  IDefaultValueMethods,
} from '../08-value/interfaces/defaultValue';

const DOCUMENT_NAME = 'DefaultValue';
const COLLECTION_NAME = 'DefaultValues';

// Declare the Schema of the Mongo model
var defaultValueSchema = new Schema<IDefaultValue, DefaultValueModel, IDefaultValueMethods>(
  {
    value: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    belongType: {
      type: Schema.Types.ObjectId,
      ref: 'Type',
    },
    belongBoard: {},
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
const DefaultValue = db.model<IDefaultValue, DefaultValueModel>(DOCUMENT_NAME, defaultValueSchema);
export default DefaultValue;
