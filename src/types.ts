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

export type Filter = LogicalFilter | FieldFilter;

export type LogicalFilterOR = {_or: Filter[]};
export type LogicalFilterAND = {_and: Filter[]};
export type LogicalFilter = LogicalFilterOR | LogicalFilterAND;

export type FieldFilter = {
  [field: string]: FieldFilterOperator | FieldFilter;
};

export type FilterContext = Record<string, any>;

export type FieldFilterOperator = {
  _eq?: string | number | boolean;
  _neq?: string | number | boolean;
  _lt?: string | number;
  _lte?: string | number;
  _gt?: string | number;
  _gte?: string | number;
  _in?: (string | number)[];
  _nin?: (string | number)[];
  _null?: boolean;
  _nnull?: boolean;
  _starts_with?: string;
  _nstarts_with?: string;
  _ends_with?: string;
  _nends_with?: string;
  _contains?: string;
  _ncontains?: string;
  _between?: (string | number)[];
  _nbetween?: (string | number)[];
  _empty?: boolean;
  _nempty?: boolean;
  _submitted?: boolean;
  _regex?: string;
};
