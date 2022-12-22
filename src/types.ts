export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'in'
  | 'nin'
  | 'null'
  | 'nnull'
  | 'contains'
  | 'ncontains'
  | 'between'
  | 'nbetween'
  | 'empty'
  | 'nempty'
  | 'submitted'
  | 'regex';

export type ClientFilterOperator =
  | FilterOperator
  | 'starts_with'
  | 'nstarts_with'
  | 'ends_with'
  | 'nends_with';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FilterContext = Record<string, any>;

export type Filter<T = FilterContext> =
  | LogicalFilter<Partial<T>>
  | FieldFilter<Partial<T>>;
export type FieldFilter<T = FilterContext> = {
  [field in keyof T]: FieldFilterOperator | FieldFilter<Partial<T[field]>>;
};

export type LogicalFilterOR<T = FilterContext> = {_or: Filter<Partial<T>>[]};
export type LogicalFilterAND<T = FilterContext> = {_and: Filter<Partial<T>>[]};
export type LogicalFilter<T = FilterContext> =
  | LogicalFilterOR<T>
  | LogicalFilterAND<T>;

export type FieldFilterOperator = {
  _eq?: string | number | boolean;
  _neq?: string | number | boolean;
  _lt?: string | number;
  _lte?: string | number;
  _gt?: string | number;
  _gte?: string | number;
  _in?: (string | number)[] | string;
  _nin?: (string | number)[] | string;
  _null?: boolean;
  _nnull?: boolean;
  _starts_with?: string;
  _nstarts_with?: string;
  _ends_with?: string;
  _nends_with?: string;
  _contains?: string;
  _ncontains?: string;
  _between?: (string | number)[] | string;
  _nbetween?: (string | number)[] | string;
  _empty?: boolean;
  _nempty?: boolean;
  _submitted?: boolean;
  _regex?: string;
};
