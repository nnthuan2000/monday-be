import lodash from 'lodash';

interface IGetInfoParams<T> {
  fields: string[];
  object: T;
}
interface IConvertToArrObj<T> {
  fields: string[];
  objects: T[];
}

export const getInfodata = <T>({ fields, object }: IGetInfoParams<T>) => {
  return lodash.pick(object, fields);
};

export const convertToArrObj = <T>({ fields = [], objects }: IConvertToArrObj<T>) => {
  return objects.map((obj) => getInfodata<T>({ fields, object: obj }));
};

export const getSelectData = (select: string[]) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};
