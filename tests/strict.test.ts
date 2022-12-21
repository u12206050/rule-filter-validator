import {validatePayload, Filter} from '../src';

describe('Test strictiness of validator', () => {
  it('Pass strict equals', () => {
    const rule = {person: {name: {_eq: 'ABC'}}};
    let errors = validatePayload(rule, {person: {name: 'ABC'}}, true);
    expect(errors).toHaveLength(0);

    errors = validatePayload(rule, {person: {name: 'abc'}}, true);
    expect(errors).toHaveLength(1);
  });

  it('Pass strict contains', () => {
    let rule: Filter = {person: {name: {_contains: 'A'}}};

    let errors = validatePayload(rule, {person: {name: 'Abc'}}, true);
    expect(errors).toHaveLength(0);

    // Fails since it should still be case sensitive
    errors = validatePayload(rule, {person: {name: 'abc'}}, true);
    expect(errors).toHaveLength(1);

    rule = {person: {username: {_contains: '12'}}};

    // Passes since `_contains` compares two strings
    errors = validatePayload(rule, {person: {username: 2012}}, true);
    expect(errors).toHaveLength(0);
  });

  it('Pass strict _in', () => {
    const rule = {person: {name: {_in: ['ZXC', 'QWE', 'ABC']}}};

    let errors = validatePayload(rule, {person: {name: 'ABC'}}, true);
    expect(errors).toHaveLength(0);

    errors = validatePayload(rule, {person: {name: 'abc'}}, true);
    expect(errors).toHaveLength(1);
  });
});
