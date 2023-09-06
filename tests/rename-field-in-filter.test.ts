import { Filter, renameFieldInFilter } from '../src';

describe('rename-field-in-filter', () => {
  it('should rename a FieldFilter', () => {
    const filter: Filter = {
      test1: {
        _eq: 'lorem',
      },
      test2: {
        _eq: 'ipsum',
      },
    };
    const expected = {
      test100: {
        _eq: 'lorem',
      },
      test2: {
        _eq: 'ipsum',
      },
    };
    expect(renameFieldInFilter(filter, 'test1', 'test100')).toEqual(expected);
  });

  it('should rename a FieldFilter nested in another FieldFilter', () => {
    const filter: Filter = {
      test1: {
        test2: {
          _eq: 'xyz',
        },
      },
    };
    const expected = {
      test1: {
        test100: {
          _eq: 'xyz',
        },
      },
    };
    expect(renameFieldInFilter(filter, 'test2', 'test100', 'test1')).toEqual(
      expected
    );
  });

  it('should rename a FieldFilter nested in a LogicalOperator', () => {
    const filter: Filter = {
      _and: [
        {
          test2: {
            _eq: 'xyz',
          },
        },
      ],
    };
    const expected = {
      _and: [
        {
          test100: {
            _eq: 'xyz',
          },
        },
      ],
    };
    expect(renameFieldInFilter(filter, 'test2', 'test100')).toEqual(
      expected
    );
  });
});
