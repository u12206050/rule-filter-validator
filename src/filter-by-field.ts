import {Filter, FieldFilter, LogicalFilter} from './types';

/**
 * This filters the given Filter object on a given field and returns a new Filter object
 * that only contains the given field and its children, if any.
 * If the input Filter object doesn't have the given field or is neither a FieldFilter nor a LogicalFilter,
 * the function returns null.
 *
 * @param filter Filter
 * @param field string
 * @returns Filter | null
 */
export function filterByField(filter: Filter, field: string): Filter | null {
  if (typeof filter !== 'object' || filter === null) {
    return null;
  }

  const keys = Object.keys(filter);
  if (keys.length === 0) {
    return null;
  }

  const logicalKey = keys[0] as keyof LogicalFilter;
  if (['_or', '_and'].includes(logicalKey)) {
    const logicalFilter = (filter as LogicalFilter)[logicalKey] as Filter[];
    if (!Array.isArray(logicalFilter)) {
      return null;
    }
    // Recursively filter the children of the LogicalFilter by the given field
    return {
      // Use the same logical operator as the original filter
      [logicalKey]: logicalFilter
        .map(f => filterByField(f, field))
        .filter(Boolean) as Array<Filter>,
    } as LogicalFilter;
  }

  // If the filter is a FieldFilter and it has the given field
  if (field in filter) {
    // Flatten the field and return its children, if any
    return (filter as FieldFilter)[field] as FieldFilter;
  }
  // If the filter is a LogicalFilter

  // If the filter is neither a FieldFilter nor a LogicalFilter, return an empty object
  return null;
}
