interface IDefaultValue {
  value: string;
  color: string;
  canEditColor: boolean;
}

interface IDefaultValuesOfType {
  [key: string]: IDefaultValue[];
}

const defaultValues: IDefaultValuesOfType = {
  Status: [
    {
      value: 'Working on it',
      color: '#fdbc64',
      canEditColor: true,
    },
    {
      value: 'Done',
      color: '#33d391',
      canEditColor: true,
    },
    {
      value: 'Stuck',
      color: '#e8697d',
      canEditColor: true,
    },
    {
      value: '',
      color: '#797e93',
      canEditColor: false,
    },
  ],
  Priority: [
    {
      value: 'Critical ⚠️️',
      color: '#5c5c5c',
      canEditColor: true,
    },
    {
      value: 'High',
      color: '#6645a9',
      canEditColor: true,
    },
    {
      value: 'Medium',
      color: '#777ae5',
      canEditColor: true,
    },
    {
      value: 'Low',
      color: '#79affd',
      canEditColor: true,
    },
    {
      value: '',
      color: '#797e93',
      canEditColor: false,
    },
  ],
  Label: [
    {
      value: 'Label 1',
      color: '#aebdca',
      canEditColor: true,
    },
    {
      value: 'Label 2',
      color: '#339ecd',
      canEditColor: true,
    },
    {
      value: 'Label 3',
      color: '#9d99b9',
      canEditColor: true,
    },
    {
      value: '',
      color: '#797e93',
      canEditColor: false,
    },
  ],
};

export default defaultValues;
