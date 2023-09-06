import { validatePayload } from '../src/index';

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
  }
};

describe('Test validations with functions', () => {
  it('Containing year function', () => {
    const errors = validatePayload(
      {person: {'year(dob)': {_eq: 1998}}},
      SCOPE
    );
    expect(errors[0]).toEqual(undefined);
  });

  it('Containing year function full', () => {
    const errors = validatePayload(
      {'year(person.dob)': {_eq: 1998}},
      SCOPE
    );
    expect(errors[0]).toEqual(undefined);
  });

  it('Containing month function', () => {
    const errors = validatePayload(
      {person: {'month(dob)': {_eq: 2}}},
      SCOPE
    );
    expect(errors[0]).toEqual(undefined);
  });

  it('Containing year function and dynamic filter', () => {
    const now = new Date();
    now.setUTCFullYear(now.getUTCFullYear() - 12);

    const errors = validatePayload(
      { person: {'year(dob)': {_eq: '$NOW(-12 years).year'}} },
      { person: { dob: now.toLocaleDateString() } }
    );
    expect(errors[0]).toEqual(undefined);
  });

  it('Containing month function in _and', () => {
    const errors = validatePayload({
      _and: [
        {person: {'month(dob)': {_eq: 2}}}
      ]},
      SCOPE
    );
    expect(errors[0]).toEqual(undefined);
  });

  it('Containing duplicate functions across _and _or', () => {
    const errors = validatePayload({
      _or: [
        { _and: [
          {person: {'month(dob)': {_eq: 1}}},
        ]},
        { _and: [
          {person: {'month(dob)': {_eq: 2}}},
        ]}, 
        { _and: [
          {person: {'month(dob)': {_eq: 3}}},
        ]},        
      ]},
      SCOPE
    );
    expect(errors[0]).toEqual(undefined);
    expect((SCOPE.person as any)['month(dob)']).toEqual(2);
  });
});
