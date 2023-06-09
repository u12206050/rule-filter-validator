import type {
  FieldFilter,
  FieldFilterOperator,
  Filter,
  LogicalFilterAND,
  LogicalFilterOR,
} from './types';

export function invertFilter(filter: Filter): FieldFilterOperator | Filter {
  if (typeof filter !== 'object') {
    return filter;
  }

  const invertedFilter: FieldFilterOperator = {};
  Object.keys(filter).forEach(key => {
    const value = filter[key as keyof Filter];
    switch (key) {
      case '_and':
        (invertedFilter as LogicalFilterOR)._or = (value as Filter[]).map(
          invertFilter
        ) as Array<Filter>;
        break;
      case '_or':
        (invertedFilter as LogicalFilterAND)._and = (value as Filter[]).map(
          invertFilter
        ) as Array<Filter>;
        break;
      case '_eq':
        invertedFilter._neq = value;
        break;
      case '_neq':
        invertedFilter._eq = value;
        break;
      case '_lt':
        invertedFilter._gte = value;
        break;
      case '_lte':
        invertedFilter._gt = value;
        break;
      case '_gt':
        invertedFilter._lte = value;
        break;
      case '_gte':
        invertedFilter._lt = value;
        break;
      case '_in':
        invertedFilter._nin = value;
        break;
      case '_nin':
        invertedFilter._in = value;
        break;
      case '_null':
        invertedFilter._nnull = value;
        break;
      case '_nnull':
        invertedFilter._null = value;
        break;
      case '_starts_with':
        invertedFilter._nstarts_with = value;
        break;
      case '_nstarts_with':
        invertedFilter._starts_with = value;
        break;
      case '_ends_with':
        invertedFilter._nends_with = value;
        break;
      case '_nends_with':
        invertedFilter._ends_with = value;
        break;
      case '_contains':
        invertedFilter._ncontains = value;
        break;
      case '_ncontains':
        invertedFilter._contains = value;
        break;
      case '_between':
        invertedFilter._nbetween = value;
        break;
      case '_nbetween':
        invertedFilter._between = value;
        break;
      case '_empty':
        invertedFilter._nempty = value;
        break;
      case '_nempty':
        invertedFilter._empty = value;
        break;
      case '_submitted':
        invertedFilter._submitted = !value;
        break;
      case '_regex':
        invertedFilter._regex = invertRegex(value);
        break;

      default:
        (invertedFilter as FieldFilter)[key] = invertFilter(value as Filter) as
          | FieldFilterOperator
          | FieldFilter;
    }
  });

  return invertedFilter;
}

function invertRegex(pattern: string): string {
  // Extract any flags from the pattern
  const flags = pattern.match(/\/([gimuy]*)$/)?.[1] || '';

  // Remove the flags from the pattern
  pattern = pattern.replace(/\/[gimuy]*$/, '');

  // Check if the pattern starts with the "not" operator (^) to invert it
  if (pattern.startsWith('^')) {
    pattern = pattern.slice(1);
  } else {
    pattern = '^' + pattern;
  }

  return flags ? `/${pattern}/${flags}` : pattern;
}
