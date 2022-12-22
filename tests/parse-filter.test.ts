import {parseFilter, validatePayload, Filter} from '../src';

test('Simple ParseFilter replacing with value from $SCOPE', () => {
  const SCOPE = {
    person: {
      age: 16,
    },
    reg: {
      age: 17,
      date: Date.now() + 1000,
    },
  };

  const testRule: Filter<typeof SCOPE> = {
    reg: {
      age: {
        _gt: '$SCOPE.person.age',
      },
      date: {
        _gt: '$NOW',
      },
    },
  };

  let result = parseFilter(testRule, {}) as any;

  expect(result.reg.age._gt).toBe('$SCOPE.person.age');

  result = parseFilter(testRule, {
    $SCOPE: SCOPE,
  }) as any;

  expect(result.reg.age._gt).toBe(16);

  const errors = validatePayload(result, SCOPE);

  expect(errors).toHaveLength(0);
});
