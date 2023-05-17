import { Schema, model } from 'mongoose';
import db from '../root/db';
import {
  DefaultValueModel,
  IDefaultValue,
  IDefaultValueMethods,
  IInitDefaultValues,
} from '../08-value/interfaces/defaultValue';
import Type from './type';

const DOCUMENT_NAME = 'DefaultValue';
const COLLECTION_NAME = 'DefaultValues';

// Declare the Schema of the Mongo model
var defaultValueSchema = new Schema<IDefaultValue, DefaultValueModel, IDefaultValueMethods>(
  {
    value: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      required: true,
      default: '#797e93',
    },
    canEditColor: {
      type: Boolean,
      default: true,
    },
    belongType: {
      type: Schema.Types.ObjectId,
      ref: 'Type',
    },
    belongBoard: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

defaultValueSchema.static(
  'initDefaultValues',
  async function initDefaultValues({ type, icon }: IInitDefaultValues) {
    const createdType = await Type.create({ name: type, icon });
    await this.create({
      belongType: createdType._id,
      canEditColor: false,
    });
  }
);

let DefaultValue: DefaultValueModel;
if (process.env.STATUS === 'import') {
  DefaultValue = model<IDefaultValue, DefaultValueModel>(DOCUMENT_NAME, defaultValueSchema);
} else {
  DefaultValue = db.model<IDefaultValue, DefaultValueModel>(DOCUMENT_NAME, defaultValueSchema);
}
export default DefaultValue;
