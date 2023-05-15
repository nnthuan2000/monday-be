import { Schema } from 'mongoose';
import db from '../root/db';
import { IValue, IValueMethods, ValueModel } from '../08-value/interfaces/value';

const DOCUMENT_NAME = 'Value';
const COLLECTION_NAME = 'Values';

// Declare the Schema of the Mongo model
var valueSchema = new Schema<IValue, ValueModel, IValueMethods>(
  {
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    typeOfValue: {
      type: String,
      required: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
const Value = db.model<IValue, ValueModel>(DOCUMENT_NAME, valueSchema);
export default Value;
