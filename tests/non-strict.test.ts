import { Filter, validatePayload } from '../src/index';

describe('Test non-strictiness of validator', () => {
  it('Pass equals', () => {
    const rule = {person: {name: {_eq: 'ABC'}}};
    let errors = validatePayload(rule, {person: {name: 'abc'}});
    expect(errors).toHaveLength(0);

    errors = validatePayload(rule, {person: {name: 'ABC'}});
    expect(errors).toHaveLength(0);
  });

  it('Pass contains', () => {
    let rule: Filter = {person: {name: {_contains: 'A'}}};

    let errors = validatePayload(rule, {person: {name: 'Abc'}});
    expect(errors).toHaveLength(0);

    // Passes since `_contains` compares two strings
    rule = {person: {age: {_contains: '12'}}};
    errors = validatePayload(rule, {person: {age: 12}});
    expect(errors).toHaveLength(0);
  }); 

  it('Pass _in', () => {
    const rule = {person: {name: {_in: ['ZXC', 'QWE', 'ABC']}}};

    const errors = validatePayload(rule, {person: {name: 'abc'}});
    expect(errors).toHaveLength(0);
  });
});
