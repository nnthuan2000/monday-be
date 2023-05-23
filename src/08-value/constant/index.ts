interface IDefaultValues {
  [key: string]: { value: string; color: string }[];
}

const defaultValues: IDefaultValues = {
  status: [
    {
      value: 'Working on it',
      color: '#fdbc64',
    },
    {
      value: 'Done',
      color: '#33d391',
    },
    {
      value: 'Stuck',
      color: '#e8697d',
    },
  ],
  priority: [
    {
      value: 'Critical ⚠️️',
      color: '#5c5c5c',
    },
    {
      value: 'High',
      color: '#6645a9',
    },
    {
      value: 'Medium',
      color: '#777ae5',
    },
    {
      value: 'Low',
      color: '#79affd',
    },
  ],
  label: [
    {
      value: 'Label 1',
      color: '#aebdca',
    },
    {
      value: 'Label 2',
      color: '#339ecd',
    },
    {
      value: 'Label 3',
      color: '#9d99b9',
    },
  ],
};

export default defaultValues;
