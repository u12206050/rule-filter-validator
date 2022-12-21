import {FieldFilter, FieldFilterOperator, Filter} from './types';
import get from 'lodash.get';
import {parseFilter} from './parse-filter';
import {isValid} from './is-valid';

const FieldFilterText: Record<keyof FieldFilterOperator, string> = {
  _eq: 'equal to',
  _neq: 'not equal to',
  _contains: 'contains',
  _ncontains: 'does not contain',
  _starts_with: 'starts with',
  _nstarts_with: 'does not start with',
  _ends_with: 'ends with',
  _nends_with: 'does not end with',
  _in: 'in',
  _nin: 'not in',
  _between: 'between',
  _nbetween: 'not between',
  _gt: 'greater than',
  _gte: 'greater than or equal to',
  _lt: 'less than',
  _lte: 'less than or equal to',
  _null: 'null =',
  _nnull: 'not null =',
  _empty: 'empty =',
  _nempty: 'not empty =',
  _submitted: 'submitted =',
  _regex: 'matching regex',
};

/**
 * Validate the payload against the given filter rules
 *
 * @param {Filter} filter - The filter rules to check against
 * @param {Record<string, any>} payload - The payload to validate
 * @param {boolean} strict(false) - Type and Case-sensitive validation
 * @returns Array<string> errors if any
 */
export function validatePayload(
  filter: Filter,
  payload: Record<string, any>,
  strict = false
) {
  const errors: string[] = [];
  validate(parseFilter(filter), payload, errors, '', strict);
  errors.reverse();

  return errors;
}

/**
 * Validate the payload against the given filter rules
 *
 * @param {Filter} filter - The filter rules to check against
 * @param {Record<string, any>} payload - The payload to validate
 * @param errors
 * @param {string} path - Optional options to pass to Joi
 * @param {boolean} strict(false) - Type and Case-sensitive validation
 * @returns { errors: Array<string> }
 */
function validate(
  filter: Filter,
  payload: Record<string, any>,
  errors: string[] = [],
  path: any = '',
  strict = false
): boolean {
  if (typeof filter !== 'object' && !filter) {
    throw new Error('Filter rule is not valid');
  }
  return Object.keys(filter).every(key => {
    const compareValue = get(filter, key) as any;

    if (String(key).startsWith('_')) {
      switch (key) {
        case '_and':
          return (compareValue as Array<FieldFilter>).every(subFilter =>
            validate(subFilter, payload, errors, path, strict)
          );
        case '_or': {
          const swallowErrors: string[] = [];
          const result = (compareValue as Array<FieldFilter>).some(subFilter =>
            validate(subFilter, payload, swallowErrors, path, strict)
          );
          if (!result) {
            // If errors then will be false if all checks fail thus &&
            errors.push(swallowErrors.join(' and '));
          }
          return result;
        }
      }

      const testValue = get(payload, path, undefined);
      const result = isValid(compareValue, key, testValue, strict);
      if (result !== null) {
        if (!result) {
          errors.push(
            `Failed: ${path
              .split('.')
              .reverse()
              .join(' of ')} is ${JSON.stringify(testValue)} and is not ${
              FieldFilterText[key as keyof FieldFilterOperator]
            } ${JSON.stringify(compareValue)}`
          );
        }

        return result;
      }
    }

    return validate(
      compareValue as Filter,
      payload,
      errors,
      [path, key].filter(s => s).join('.'),
      strict
    );
  });
}
