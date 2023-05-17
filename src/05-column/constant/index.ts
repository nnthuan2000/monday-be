export enum MultipleValueTypes {
  STATUS = 'status',
  PRIORITY = 'priority',
  LABEL = 'label',
}

export const multipleValueTypes = {
  status: {
    name: MultipleValueTypes.STATUS,
    icon: 'http://localhost:3001/v1/api/images/status-column-icon.svg',
  },
  priority: {
    name: MultipleValueTypes.PRIORITY,
    icon: 'http://localhost:3001/v1/api/images/priority-column-icon.svg',
  },
  label: {
    name: MultipleValueTypes.LABEL,
    icon: 'http://localhost:3001/v1/api/images/label-column-icon.png',
  },
};

export enum SingleValueTypes {
  DATE = 'date',
  NUMBER = 'number',
  TEXT = 'text',
}

export const singleValueTypes = {
  date: {
    name: SingleValueTypes.DATE,
    icon: 'http://localhost:3001/v1/api/images/date-column-icon.svg',
  },
  number: {
    name: SingleValueTypes.NUMBER,
    icon: 'http://localhost:3001/v1/api/images/number-column-icon.svg',
  },
  text: {
    name: SingleValueTypes.TEXT,
    icon: 'http://localhost:3001/v1/api/images/text-column-icon.svg',
  },
};
