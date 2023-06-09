import { Filter, parseFilter, validatePayload } from '../src/index';

const SCOPE = {
  person: {
    id: 1,
    dob: '1998-02-18',
    age: '23',
    active: true,
    gender: 'F',
  },
  org: {
    id: 10,
    country: 'no',
    continent: 'europe',
  },
  skills: ['javascript', 'typescript', 'nodejs'],
  meta: {
    date: new Date(),
    time: new Date().getTime(),
  },
};

const testRule = (rule: Filter, resultLength = 0) => {
  const filter = parseFilter(rule, {
    $SCOPE: SCOPE,
  }) as Filter;

  const errors = validatePayload(filter, SCOPE);

  if (!resultLength) {
    expect(errors).toEqual([]);
  } else {
    expect(errors).toHaveLength(resultLength);
  }
};

describe('Test basic validations', () => {
  it('Passes simple test', () => {
    const errors = validatePayload(
      {person: {age: {_lt: '18'}}},
      {person: {age: 4}}
    );
    expect(errors).toEqual([]);
  });

  it('Validate gt and lt (number)', () => {
    testRule(
      {
        person: {
          age: {
            _gt: 18,
            _lt: '25',
          },
        },
      },
      0
    );
  });

  it('Check error of gt and lt', () => {
    testRule(
      {
        person: {
          age: {
            _gt: 25,
            _lt: 18,
          },
        },
      },
      1
    );
  });

  it('Validate gt and lt (string)', () => {
    testRule(
      {
        org: {
          country: {
            _gt: 'nb',
          },
        },
      },
      0
    );
  });

  it('Check boolean _eq', () => {
    testRule(
      {
        person: {
          active: {
            _eq: true,
          },
        },
      },
      0
    );
  });

  it('Check boolean with _neq', () => {
    testRule(
      {
        person: {
          active: {
            _neq: true,
          },
        },
      },
      1
    );
  });

  it('Check two values _between', () => {
    testRule(
      {
        org: {
          id: {
            _between: [9, 11],
          },
        },
      },
      0
    );
  });

  it('Check two date values _between', () => {
    testRule(
      {
        person: {
          dob: {
            _between: ['1987-01-01T00:00:00', '2010-12-31T23:00:00'],
          },
        },
      },
      0
    );
  });

  it('Check error two date values _between', () => {
    testRule(
      {
        person: {
          dob: {
            _between: ['1987-01-01T00:00:00', '1990-12-31T23:00:00'],
          },
        },
      },
      1
    );
  });

  it('Check two values _nbetween', () => {
    testRule(
      parseFilter({
        org: {
          id: {
            _nbetween: '9, 11',
          },
        },
      }),
      1
    );
  });

  it('Check _starts_with', () => {
    testRule(
      parseFilter({
        org: {
          country: {
            _starts_with: 'no',
          },
        },
      }),
      0
    );
  });

  it('Check _ends_with', () => {
    testRule(
      parseFilter({
        org: {
          continent: {
            _ends_with: 'ope',
          },
        },
      }),
      0
    );
  });

  it('Check _in', () => {
    testRule(
      parseFilter({
        org: {
          id: {
            _in: ['8', '9', '10', '11'],
          },
        },
      }),
      0
    );
  });

  it('Check _in', () => {
    testRule(
      parseFilter({
        org: {
          country: {
            _in: ['no', 'sw', 'dk'],
          },
        },
      }),
      0
    );
  });

  it('Check _contains on array field', () => {
    testRule(
      parseFilter({
        skills: {
          _contains: 'typescript',
        },
      }),
      0
    );
  });

  it('Check multiple _contains on array field', () => {
    testRule(
      parseFilter({
        _and: [
          {
            skills: {
              _contains: 'typescript',
            },
          },
          {
            skills: {
              _contains: 'javascript',
            },
          },
        ],
      }),
      0
    );
  });

  it('Should fail if _contains is used on array field and test value is string', () => {
    testRule(
      parseFilter({
        skills: {
          _contains: 'javascript,typescript',
        },
      }),
      1
    );
  });
});

describe('validatePayload', () => {
  it('returns an empty array when there are no errors', () => {
    const mockFilter = {_and: [{field: {_eq: 'field'}}]} as Filter;
    const mockPayload = {field: 'field'};
    expect(validatePayload(mockFilter, mockPayload)).toStrictEqual([]);
  });
  it('returns an array of 1 when there errors with an _and operator', () => {
    const mockFilter = {_and: [{field: {_eq: 'field'}}]} as Filter;
    const mockPayload = {field: 'test'};
    expect(validatePayload(mockFilter, mockPayload)).toHaveLength(1);
  });
  it('returns an array of 1 when there errors with an _or operator', () => {
    const mockFilter = {_or: [{field: {_eq: 'field'}}]} as Filter;
    const mockPayload = {field: 'test'};
    expect(validatePayload(mockFilter, mockPayload)).toHaveLength(1);
  });

  it('returns an array of 1 when there errors with an _or containing _and operators', () => {
    const mockFilter = {
      _or: [
        {
          _and: [{a: {_eq: 1}}, {b: {_eq: 1}}],
        },
        {
          _and: [{a: {_eq: 2}}, {b: {_eq: 2}}],
        },
      ],
    } as Filter;

    const mockPayload = {
      a: 0,
      b: 0,
    };

    expect(validatePayload(mockFilter, mockPayload)).toHaveLength(1);
  });
});
