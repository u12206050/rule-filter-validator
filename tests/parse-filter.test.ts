import { parseFilter, validatePayload, Filter } from '../src';

test('Simple ParseFilter replacing with value from $SCOPE', () => {
    const testRule: Filter = {
        reg: {
            age: {
                _gt: "$SCOPE.person.age"
            },
            date: {
                _gt: "$NOW"
            }
        }
    }

    const SCOPE = {
        person: {
            age: 16
        },
        reg: {
            age: 17,
            date: Date.now() + 1000
        }
    }

    let result = parseFilter(testRule, {}) as any

    expect(result.reg.age._gt).toBe("$SCOPE.person.age");

    result = parseFilter(testRule, {
        $SCOPE: SCOPE
    }) as any

    expect(result.reg.age._gt).toBe(16);

    let errors = validatePayload(result, SCOPE);

    expect(errors).toHaveLength(0);
});