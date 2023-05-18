import { Model } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';

export interface IType {
  name: string;
  icon: string;
  color: string;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

// For instance methods

export type ITypeDoc = Doc<IType, ITypeMethods>;
export type ITypeDocObj = DocObj<IType>;

export interface ITypeMethods {}

// For statics
export interface TypeModel extends Model<IType, {}, ITypeMethods> {
  createTypes(): Promise<null>;
}
