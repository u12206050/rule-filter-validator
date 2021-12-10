import {parseFilter, validatePayload, Filter} from '../src/index';

const SCOPE = {
    person: {
        id: 1,
        dob: "1998-02-18",
        age: '23',
        active: true,
        gender: 'F'
    },
    org: {
        id: 10,
        country: 'no',
        continent: 'europe'
    },
    meta: {
        date: new Date(),
        time: new Date().getTime()
    }
}

const testRule = (rule: Filter, resultLength = 0) =>
{
    const filter = parseFilter(rule, {
        $SCOPE: SCOPE
    }) as Filter

    let errors = validatePayload(filter, SCOPE);

    expect(errors).toHaveLength(resultLength);
}
describe('Test basic validations', () => {
    it('Passes simple test', () => {
        let errors = validatePayload({person: { age: { _lt: "18" }}}, {person: { age: 4 }});
        expect(errors).toHaveLength(0);
    })


    it('Validate gt and lt', () => {
        testRule({
            "person": {
                "age": {
                    "_gt": 18,
                    "_lt": '25'
                }
            }
        }, 0)
    });

    it('Check error of gt and lt', () => {
        testRule({
            "person": {
                "age": {
                    "_gt": 25,
                    "_lt": 18
                }
            }
        }, 1)
    });

    it('Check boolean _eq', () => {
        testRule({
            "person": {
                "active": {
                    "_eq": true,
                }
            }
        }, 0)
    });

    it('Check boolean with _neq', () => {
        testRule({
            "person": {
                "active": {
                    "_neq": true,
                }
            }
        }, 1)
    });

    it('Check two values _between', () => {
        testRule({
            "org": {
                "id": {
                    "_between": [9, 11],
                }
            }
        }, 0)
    });

    it('Check two values _nbetween', () => {
        testRule(parseFilter({
            "org": {
                "id": {
                    "_nbetween": "9, 11",
                }
            }
        } as any), 1)
    });

    it('Check _starts_with', () => {
        testRule(parseFilter({
            "org": {
                "country": {
                    "_starts_with": "no",
                }
            }
        } as any), 0)
    });

    it('Check _ends_with', () => {
        testRule(parseFilter({
            "org": {
                "continent": {
                    "_ends_with": "ope",
                }
            }
        } as any), 0)
    });
});

describe('validatePayload', () => {
    it('returns an empty array when there are no errors', () => {
        const mockFilter = { _and: [{ field: { _eq: 'field' } }] } as Filter;
        const mockPayload = { field: 'field' };
        expect(validatePayload(mockFilter, mockPayload)).toStrictEqual([]);
    });
    it('returns an array of 1 when there errors with an _and operator', () => {
        const mockFilter = { _and: [{ field: { _eq: 'field' } }] } as Filter;
        const mockPayload = { field: 'test' };
        expect(validatePayload(mockFilter, mockPayload)).toHaveLength(1);
    });
    it('returns an array of 1 when there errors with an _or operator', () => {
        const mockFilter = { _or: [{ field: { _eq: 'field' } }] } as Filter;
        const mockPayload = { field: 'test' };
        expect(validatePayload(mockFilter, mockPayload)).toHaveLength(1);
    });
});