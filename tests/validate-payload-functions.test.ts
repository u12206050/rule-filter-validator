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

describe('Test validations with functions', () => {
  it('Containing year function', () => {
    const errors = validatePayload(
      {person: {'year(dob)': {_eq: 1998}}},
      SCOPE
    );
    expect(errors).toEqual([]);
  });

  it('Containing month function', () => {
    const errors = validatePayload(
      {person: {'month(dob)': {_eq: 2}}},
      SCOPE
    );
    expect(errors).toHaveLength(0);
  });

  it('Containing year function and dynamic filter', () => {
    const now = new Date();
    now.setUTCFullYear(now.getUTCFullYear() - 12);

    const errors = validatePayload(
      { person: {'year(dob)': {_eq: '$NOW(-12 years).year'}} },
      { person: { dob: now.toLocaleDateString() } }
    );
    expect(errors).toEqual([]);
  });

});