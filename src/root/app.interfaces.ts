import { Request } from 'express';
import { FlattenMaps, Types, Document } from 'mongoose';
import { Fn } from './utils/catchAsync';

export type Doc<T, K> =
  | (Document<unknown, {}, T> & Omit<T & { _id: Types.ObjectId }, keyof K> & K)
  | null;

export type DocObj<T> = (FlattenMaps<T> & { _id: Types.ObjectId }) | null;

export type SelectOptions<T> = {
  [K in keyof T]: number;
};

export interface ISelectQueryOptions<T> {
  filter: Partial<T>;
  sort?: {};
  select?: string[];
}

export interface IRequestQuery {
  [key: string]: string;
}



export interface IControllerWithoutGet<T extends Request> {
  createOne: Fn<T>;
  updateOne: Fn<T>;
  deleteOne: Fn<T>;
}

export interface IFullController<T extends Request> extends IControllerWithoutGet<T> {
  getAll: Fn<T>;
  getOne: Fn<T>;
}
