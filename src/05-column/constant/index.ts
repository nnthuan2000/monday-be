export enum MultipleValueTypes {
  STATUS = 'Status',
  PRIORITY = 'Priority',
  LABEL = 'Label',
}

export const multipleValueTypes = {
  status: {
    name: MultipleValueTypes.STATUS,
    icon: `${process.env.SERVER_URL}/v1/api/images/status-column-icon.svg`,
    color: '#11dd80',
  },
  priority: {
    name: MultipleValueTypes.PRIORITY,
    icon: `${process.env.SERVER_URL}/v1/api/images/priority-column-icon.png`,
    color: '#feca00',
  },
  label: {
    name: MultipleValueTypes.LABEL,
    icon: `${process.env.SERVER_URL}/v1/api/images/label-column-icon.png`,
    color: '#a358df',
  },
};

export enum SingleValueTypes {
  DATE = 'Date',
  NUMBER = 'Number',
  TEXT = 'Text',
}

export const singleValueTypes = {
  date: {
    name: SingleValueTypes.DATE,
    icon: `${process.env.SERVER_URL}/v1/api/images/date-column-icon.svg`,
    color: '#11dd80',
  },
  number: {
    name: SingleValueTypes.NUMBER,
    icon: `${process.env.SERVER_URL}/v1/api/images/numeric-column-icon.svg`,
    color: '#ffcc00',
  },
  text: {
    name: SingleValueTypes.TEXT,
    icon: `${process.env.SERVER_URL}/v1/api/images/text-column-icon.svg`,
    color: '#00a9ff',
  },
};
