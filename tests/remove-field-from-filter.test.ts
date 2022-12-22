import {Filter, removeFieldFromFilter} from '../src';

describe('remove-field-from-filter', () => {
  it('should remove a FieldFilter', () => {
    const filter: Filter = {
      test1: {
        _eq: 'lorem',
      },
      test2: {
        _eq: 'ipsum',
      },
    };
    const expected = {
      test2: {
        _eq: 'ipsum',
      },
    };
    expect(removeFieldFromFilter(filter, 'test1')).toEqual(expected);
  });

  it('should remove a FieldFilter nested in another FieldFilter', () => {
    const filter: Filter = {
      test1: {
        deeper: {
          _eq: 'lorem',
        },
        leave: {
          _eq: 'x',
        },
      },
      test2: {
        _eq: 'ipsum',
      },
    };
    const expected = {
      test1: {
        leave: {
          _eq: 'x',
        },
      },
      test2: {
        _eq: 'ipsum',
      },
    };
    expect(removeFieldFromFilter(filter, 'deeper', 'test1')).toEqual(expected);
  });

  it('should remove a FieldFilter nested in a LogicalOperator', () => {
    const filter: Filter = {
      _and: [
        {
          test1: {
            _eq: 'lorem',
          },
        },
        {
          test2: {
            _eq: 'ipsum',
          },
        },
      ],
    };
    const expected: Filter = {
      _and: [
        {
          test2: {
            _eq: 'ipsum',
          },
        },
      ],
    };
    expect(removeFieldFromFilter(filter, 'test1', '_and')).toEqual(expected);
  });
});
