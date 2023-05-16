import lodash from 'lodash';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import TasksColumns from '../../models/tasksColumns';
import { IColumnDoc } from '../../05-column/interfaces/column';
import { ClientSession, Types } from 'mongoose';

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

export const createSetOfTasksColumns = async (
  defaultValues: IDefaultValueDoc[],
  columns: NonNullable<IColumnDoc>[],
  session: ClientSession
) => {
  const result: Types.ObjectId[] = [];
  for (const [i, value] of defaultValues.entries()) {
    const createdNewTasksColumns = await TasksColumns.create(
      [
        {
          value: value ? value._id : value,
          belongColumn: columns[i],
          typeOfValue: value ? 'multiple' : 'single',
        },
      ],
      { session }
    );
    result.push(createdNewTasksColumns[0]._id);
  }
  return result;
};
