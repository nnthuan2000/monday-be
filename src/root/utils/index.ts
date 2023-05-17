import lodash from 'lodash';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import TasksColumns from '../../models/tasksColumns';
import { IColumnDoc } from '../../05-column/interfaces/column';
import { ClientSession, Types } from 'mongoose';
import { ITaskDoc } from '../../07-task/interfaces/task';
import Task from '../../models/task';

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

interface ICreateSetOfTasksColumnsByTask {
  defaultValues: IDefaultValueDoc[];
  columns: NonNullable<IColumnDoc>[];
  taskDoc: NonNullable<ITaskDoc>;
  session: ClientSession;
}

export const createSetOfTasksColumnsByTask = async ({
  columns,
  defaultValues,
  session,
  taskDoc,
}: ICreateSetOfTasksColumnsByTask) => {
  let result: ITaskDoc = null;
  for (const [i, value] of defaultValues.entries()) {
    const createdNewTasksColumns = await TasksColumns.create(
      [
        {
          value: value ? null : value,
          valueId: value ? value._id : null,
          belongColumn: columns[i],
          belongTask: taskDoc._id,
          typeOfValue: value ? 'multiple' : 'single',
        },
      ],
      { session }
    );
    result = await Task.findByIdAndUpdate(
      taskDoc._id,
      {
        $push: {
          values: createdNewTasksColumns[0]._id,
        },
        new: true,
      },
      { session }
    );
  }
  return result;
};

interface ICreateSetOfTasksColumnsByColumn {
  taskDoc: NonNullable<ITaskDoc>;
  columnId: Types.ObjectId;
  typeOfValue: string;
  defaultValue: NonNullable<IDefaultValueDoc> | null;
  session: ClientSession;
}

export const createSetOfTasksColumnsByColumn = async ({
  columnId,
  defaultValue,
  taskDoc,
  typeOfValue,
  session,
}: ICreateSetOfTasksColumnsByColumn) => {
  const [createdNewTasksColumns] = await TasksColumns.create(
    [
      {
        value: null,
        valueId: defaultValue ? defaultValue._id : null,
        belongColumn: columnId,
        belongTask: taskDoc._id,
        typeOfValue,
      },
    ],
    { session }
  );
  await taskDoc.updateOne(
    {
      $push: {
        values: createdNewTasksColumns._id,
      },
    },
    { session }
  );
  return createdNewTasksColumns._id;
};
