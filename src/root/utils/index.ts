import lodash from 'lodash';
import { IDefaultValueDoc } from '../../08-value/interfaces/defaultValue';
import TasksColumns from '../../models/tasksColumns';
import { ClientSession, Types } from 'mongoose';
import { ITaskDoc } from '../../07-task/interfaces/task';
import Task from '../../models/task';
import { IColumnDoc } from '../../05-column/interfaces/column';

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
  columns: NonNullable<IColumnDoc>[];
  taskDoc: NonNullable<ITaskDoc>;
  session: ClientSession;
}

export const createSetOfTasksColumnsByTask = async ({
  columns,
  session,
  taskDoc,
}: ICreateSetOfTasksColumnsByTask) => {
  const creatingTasksColumnsPromises = columns.map((column) =>
    TasksColumns.createNewTasksColumns({
      data: {
        value: '',
        valueId: column.defaultValues.length !== 0 ? column.defaultValues[0]._id : null,
        belongColumn: column._id,
        belongTask: taskDoc._id,
        typeOfValue: column.defaultValues.length !== 0 ? 'multiple' : 'single',
      },
      session,
    })
  );

  return await Promise.all(creatingTasksColumnsPromises);
};

interface ICreateSetOfTasksColumnsByTask1 {
  selectedDefaultValues: IDefaultValueDoc[];
  columns: NonNullable<IColumnDoc>[];
  taskDoc: NonNullable<ITaskDoc>;
  session: ClientSession;
}

export const createSetOfTasksColumnsByTask1 = async ({
  selectedDefaultValues,
  columns,
  session,
  taskDoc,
}: ICreateSetOfTasksColumnsByTask1) => {
  let result: ITaskDoc = null;
  for (const [i, column] of columns.entries()) {
    const createdNewTasksColumns = await TasksColumns.create(
      [
        {
          value: '',
          valueId: selectedDefaultValues[i]?._id || null,
          belongColumn: column._id,
          belongTask: taskDoc._id,
          typeOfValue: selectedDefaultValues[i] ? 'multiple' : 'single',
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
  position: number;
  defaultValue: NonNullable<IDefaultValueDoc> | null;
  session: ClientSession;
}

export const createSetOfTasksColumnsByColumn = async ({
  columnId,
  defaultValue,
  taskDoc,
  position,
  typeOfValue,
  session,
}: ICreateSetOfTasksColumnsByColumn) => {
  const [createdNewTasksColumns] = await TasksColumns.create(
    [
      {
        value: '',
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
        values: {
          $each: [createdNewTasksColumns._id],
          $position: position,
        },
      },
    },
    { new: true, session }
  );

  return await createdNewTasksColumns.populate({
    path: 'valueId',
    select: '_id value color',
  });
};
