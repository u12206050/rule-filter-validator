import type {
  Filter,
  LogicalFilter,
  LogicalFilterAND,
  LogicalFilterOR,
} from './types';

/**
 *
 * @param filter Filter
 * @param field string name of field to remove
 * @param filterPath (optional)
 * @param _history (private)
 * @returns
 */
export function removeFieldFromFilter(
  filter: Filter,
  field: string,
  filterPath = '',
  _history = ''
): Filter | any {
  if (typeof filter !== 'object' || filter === null) {
    return filter;
  }

  const keys = Object.keys(filter) as Array<keyof Filter>;
  if (keys.length === 0) {
    return filter;
  }

  const alteredFilter: Filter = {};
  keys.forEach(key => {
    const value = filter[key];

    if (Array.isArray(value)) {
      const logicalKey = key as keyof LogicalFilter;
      const logicalFilter = () =>
        (value as Filter[])
          .map((subFilter: Filter) =>
            removeFieldFromFilter(
              subFilter,
              field,
              filterPath,
              `${_history}.${key}`
            )
          )
          .filter(Boolean) as Array<Filter>;

      if (logicalKey === '_or') {
        (alteredFilter as LogicalFilterOR)._or = logicalFilter().filter(
          v => Object.keys(v).length > 0
        );
      } else if (logicalKey === '_and') {
        (alteredFilter as LogicalFilterAND)._and = logicalFilter().filter(
          v => Object.keys(v).length > 0
        );
      } else {
        alteredFilter[key] = value;
      }

      return;
    }

    const alteredValue = removeFieldFromFilter(
      value,
      field,
      filterPath,
      _history + '.' + key
    );

    if (key === field && (!filterPath || _history.endsWith(filterPath))) {
      return;
    }

    alteredFilter[key] = alteredValue;
  });

  return alteredFilter;
}
