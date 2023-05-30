import { SingleValueTypes } from '../../05-column/constant';
import validator from 'validator';
import { BadRequestError } from '../responseHandler/error.response';

export const checkValidType = (type: SingleValueTypes, input: string) => {
  switch (type) {
    case SingleValueTypes.DATE:
      return validator.isDate(input);
    case SingleValueTypes.NUMBER:
      return validator.isNumeric(input);
    case SingleValueTypes.TEXT:
      return validator.isAlpha(input);
    default:
      throw new BadRequestError(`Invalid type: ${type}`);
  }
};
