import { Schema, model } from 'mongoose';
import { IType, ITypeMethods, TypeModel } from '../05-column/interfaces/type';
import { MultipleValueTypes, SingleValueTypes } from '../05-column/constant';
import db from '../root/db';

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
  const creatingEnumerationTypes = Object.values(MultipleValueTypes).map(async (type) => {
    await this.create({ name: type });
  });
  const creatingScalarTypes = Object.values(SingleValueTypes).map(async (type) => {
    await this.create({ name: type });
  });
  await Promise.all([...creatingEnumerationTypes, ...creatingScalarTypes]);
});

//Export the model
let Type: TypeModel;
if (process.env.STATUS === 'import') {
  Type = model<IType, TypeModel>(DOCUMENT_NAME, typeSchema);
} else {
  Type = db.model<IType, TypeModel>(DOCUMENT_NAME, typeSchema);
}
export default Type;
