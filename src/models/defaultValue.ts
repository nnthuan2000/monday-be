import { Schema, model } from 'mongoose';
import db from '../root/db';
import {
  DefaultValueModel,
  ICreateNewDefaultValuesByColumn,
  IDefaultValue,
  IDefaultValueMethods,
  IInitDefaultValues,
} from '../08-value/interfaces/defaultValue';
import Type from './type';
import defaultValues from '../08-value/constant';

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
  async function initDefaultValues({ type, icon, color }: IInitDefaultValues) {
    const createdType = await Type.create({ name: type, icon, color });
    await this.create({
      belongType: createdType._id,
      canEditColor: false,
    });
  }
);

defaultValueSchema.static(
  'createNewDefaultValuesByColumn',
  async function createNewDefaultValuesByColumn({
    boardId,
    typeDoc,
    createdBy,
    session,
  }: ICreateNewDefaultValuesByColumn) {
    const defaultValuesOfType = defaultValues[typeDoc.name];
    if (defaultValuesOfType) {
      const convertedToDefaultValues: IDefaultValue[] = defaultValuesOfType.map((defaultValue) => ({
        ...defaultValue,
        belongType: typeDoc._id,
        belongBoard: boardId,
        createdBy,
        canEditColor: true,
      }));

      const insertedDefaultValues = await DefaultValue.insertMany(convertedToDefaultValues, {
        session,
      });

      const foundDefaultValue = await DefaultValue.findOne(
        {
          belongType: typeDoc._id,
        },
        {},
        { session }
      );

      const values = [...insertedDefaultValues, foundDefaultValue!];

      return values;
    }
    return [];
  }
);

let DefaultValue: DefaultValueModel;
if (process.env.STATUS === 'import') {
  DefaultValue = model<IDefaultValue, DefaultValueModel>(DOCUMENT_NAME, defaultValueSchema);
} else {
  DefaultValue = db.model<IDefaultValue, DefaultValueModel>(DOCUMENT_NAME, defaultValueSchema);
}
export default DefaultValue;
