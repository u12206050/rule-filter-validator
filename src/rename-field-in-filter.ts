import {
  Filter,
  LogicalFilter,
  LogicalFilterAND,
  LogicalFilterOR,
} from './types';

/**
 *
 * @param filter
 * @param oldField
 * @param newField
 * @param filterPath
 * @param history
 * @returns
 */
export function renameFieldInFilter(
  filter: Filter,
  oldField: string,
  newField: string,
  filterPath = '',
  history = ''
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
          .map((subFilter: Filter, i) =>
            renameFieldInFilter(
              subFilter,
              oldField,
              newField,
              filterPath,
              `${history}.${key}[${i}]`
            )
          )
          .filter(Boolean) as Array<Filter>;

      if (logicalKey === '_or') {
        (alteredFilter as LogicalFilterOR)._or = logicalFilter();
      } else if (logicalKey === '_and') {
        (alteredFilter as LogicalFilterAND)._and = logicalFilter();
      } else {
        alteredFilter[key] = value;
      }

      return;
    }

    const alteredValue = renameFieldInFilter(
      value,
      oldField,
      newField,
      filterPath,
      history + '.' + key
    );

    if (key === oldField && (!filterPath || history.includes(filterPath))) {
      alteredFilter[newField] = alteredValue;
      return;
    }

    alteredFilter[key] = alteredValue;
  });

  return alteredFilter;
}