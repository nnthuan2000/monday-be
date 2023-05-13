import { Request, Response, NextFunction } from 'express';

export type Fn<T extends Request> = (req: T, res: Response, next: NextFunction) => Promise<void>;

export type TypeCatchAsyncFn = <T extends Request>(
  fn: Fn<T>
) => (req: T, res: Response, next: NextFunction) => Promise<void>;

export const catchAsync: TypeCatchAsyncFn = (fn) => {
  return async (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
