import { Schema, model } from 'mongoose';
import { IType, ITypeMethods, TypeModel } from '../05-column/interfaces/type';
import { MultipleValueTypes, SingleValueTypes } from '../05-column/constant';
import db from '../root/db';
import DefaultValue from './defaultValue';

const DOCUMENT_NAME = 'Type';
const COLLECTION_NAME = 'Types';

// Declare the Schema of the Mongo model
var typeSchema = new Schema<IType, TypeModel, ITypeMethods>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

typeSchema.static('createTypes', async function createTypes() {
  const creatingMultipleValueTypes = Object.values(MultipleValueTypes).map((type) =>
    DefaultValue.initDefaultValues({ type })
  );
  const creatingSingleValueTypes = Object.values(SingleValueTypes).map((type) =>
    this.create({ name: type })
  );

  await Promise.all([...creatingMultipleValueTypes, ...creatingSingleValueTypes]);
});

//Export the model
let Type: TypeModel;
if (process.env.STATUS === 'import') {
  Type = model<IType, TypeModel>(DOCUMENT_NAME, typeSchema);
} else {
  Type = db.model<IType, TypeModel>(DOCUMENT_NAME, typeSchema);
}
export default Type;
