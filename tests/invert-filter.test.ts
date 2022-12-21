import {Filter, invertFilter, validatePayload} from '../src';
// TODO: Create tests for invert filter function

describe('invertFilter', () => {
  it('should invert a FieldFilterOperator', () => {
    const filter: Filter = {
      test1: {
        _eq: 'this',
        _lt: 1,
        _lte: 2,
        _gt: 3,
        _gte: 4,
        _in: ['a', 'b', 'c'],
        _null: true,
        _starts_with: 'is',
        _ends_with: 'is',
        _contains: 'is',
        _between: [10, 20],
        _empty: true,
        _submitted: true,
        _regex: '^test$',
      },
      test2: {
        _neq: 'that',
        _nin: ['d', 'e', 'f'],
        _nnull: true,
        _nstarts_with: 'at',
        _nends_with: 'at',
        _ncontains: 'at',
        _nbetween: [30, 40],
        _nempty: true,
      },
    };
    const expected = {
      test1: {
        _neq: 'this',
        _gte: 1,
        _gt: 2,
        _lte: 3,
        _lt: 4,
        _nin: ['a', 'b', 'c'],
        _nnull: true,
        _nstarts_with: 'is',
        _nends_with: 'is',
        _ncontains: 'is',
        _nbetween: [10, 20],
        _nempty: true,
        _submitted: false,
        _regex: 'test$',
      },
      test2: {
        _eq: 'that',
        _in: ['d', 'e', 'f'],
        _null: true,
        _starts_with: 'at',
        _ends_with: 'at',
        _contains: 'at',
        _between: [30, 40],
        _empty: true,
      },
    };
    expect(invertFilter(filter)).toEqual(expected);
  });

  it('should invert a LogicalFilterOperators', () => {
    const filter: Filter = {
      _and: [
        {
          test1: {
            _eq: 'this',
          },
        },
        {
          test2: {
            _neq: 'that',
          },
        },
      ],
    };

    const expected: Filter = {
      _or: [
        {
          test1: {
            _neq: 'this',
          },
        },
        {
          test2: {
            _eq: 'that',
          },
        },
      ],
    };

    expect(invertFilter(filter)).toEqual(expected);

    const payload = {test1: 'this', test2: 'dat'};
    // First should be valid, second should not
    expect(validatePayload(filter, payload)).toHaveLength(0);
    expect(validatePayload(expected, payload)).toHaveLength(1);
  });
});
