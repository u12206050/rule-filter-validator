/* eslint-disable @typescript-eslint/ban-ts-comment */
import { get } from 'lodash-es';
import { adjustDate } from './adjust-date.js';
import { functions } from './functions.js';
import { toArray } from './to-array.js';
import type { FieldFunction, Filter, FilterContext } from './types';

export const parseFilter = (
  filter: Filter,
  context: FilterContext = {}
): Filter => {
  return Object.entries(filter).reduce((result: Filter, [key, value]) => {
    if (['_or', '_and'].includes(key)) {
      // @ts-ignore
      result[key] = (value as Filter[]).map((filter: Filter) =>
        parseFilter(filter, context)
      );
    } else if (['_in', '_nin', '_between', '_nbetween'].includes(key)) {
      // @ts-ignore
      result[key] = toArray(value).flatMap(value =>
        parseFilterValue(value, context)
      );
    } else if (key.startsWith('_')) {
      // @ts-ignore
      result[key] = parseFilterValue(value, context);
    } else {
      // @ts-ignore
      result[key] = parseFilter(value as Filter, context);
    }
    return result;
  }, {}) as Filter;
};

function parseFilterValue(value: any, context: FilterContext) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === 'NULL') return null;
  if (typeof value === 'string' && value.startsWith('$'))
    return parseDynamicVariable(value, context);
  return value;
}

function parseDynamicVariable(value: any, context: FilterContext) {
  if (value.startsWith('$NOW')) {
    if (value.includes('(') && value.includes(')')) {
      const [matched, adjustment, functionName] = value.match(/\(([^)]+)\)(?:\.(\w+))?/) as [string, string, FieldFunction?];
      if (!adjustment) return new Date();
      let date = adjustDate(new Date(), adjustment);
      return functionName ? functions[functionName](date) : date;
    }

    return new Date();
  }

  return get(context, value, value);
}
