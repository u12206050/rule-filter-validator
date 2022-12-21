import {FieldFilter, FieldFilterOperator, Filter, LogicalFilter} from './types';

/**
 * This extracts the given field from the passed Filter and returns a new Filter object
 * that only contains only the given field and its children, if any.
 * If the input Filter object doesn't have the given field or is neither a FieldFilter nor a LogicalFilter,
 * the function returns null.
 *
 * @param filter Filter
 * @param field string name of field to extract
 * @param filterPath (optional)
 * @param _history (private)
 * @returns
 */
export function extractFieldFromFilter(
  filter: Filter,
  field: string,
  filterPath = '',
  _history = ''
): Filter | null {
  if (typeof filter !== 'object' || filter === null) {
    return filter;
  }

  const keys = Object.keys(filter) as Array<keyof Filter>;
  if (keys.length === 0) {
    return filter;
  }

  let extractedFilter: Filter | undefined;
  const alteredFilter: Filter = {};
  keys.forEach(key => {
    const value = filter[key];

    if (Array.isArray(value)) {
      const logicalKey = key as keyof LogicalFilter;

      const flattenedLogicalFilter = () => {
        const filters = (value as Filter[])
          .map((subFilter: Filter, i) =>
            extractFieldFromFilter(
              subFilter,
              field,
              filterPath,
              `${_history}.${key}[${i}]`
            )
          )
          .filter(Boolean) as Array<Filter>;

        if (filters.length === 0) {
          return {};
        }
        if (filters.length === 1) {
          return filters[0];
        }
        return {[logicalKey]: filters};
      };

      if (logicalKey === '_or' || logicalKey === '_and') {
        Object.assign(alteredFilter, flattenedLogicalFilter());
      } else {
        alteredFilter[key] = value;
      }

      return;
    }

    const extractedValue = extractFieldFromFilter(
      value,
      field,
      filterPath,
      _history + '.' + key
    );

    if (key === field && (!filterPath || _history.includes(filterPath))) {
      extractedFilter = {[field]: extractedValue} as Filter;
      return;
    }

    alteredFilter[key] = extractedValue as FieldFilterOperator | FieldFilter;
  });

  return extractedFilter || alteredFilter;
}
