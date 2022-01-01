import {validatePayload, Filter} from '../src';

describe('Test or rule', () => {
    it('Passes simple test', () => {
        const rule = {_or: [{person: {age: {_eq: 5}}}, {person: {age: {_eq: 4}}}]}
        let errors = validatePayload(rule, {person: {age: 4}});
        expect(errors).toHaveLength(0);

        errors = validatePayload(rule, {person: {age: 3}});
        expect(errors).toHaveLength(1);
    })


    it('Passes large test', () => {
        const rule: Filter = {"_or": [{"org": {"id": {"_in": ["42", "44", "46"]}}}, {"org": {"country": {"_in": ["AR", "AW", "AU"]}}}, {"org": {"country": {"_in": ["PE", "PL"]}}}, {"org": {"country": {"_in": ["UA", "US"]}}}]}

        let errors = validatePayload(rule, {"org": {"name": "Valid", "id": 42}});
        expect(errors).toHaveLength(0);

        errors = validatePayload(rule, {"org": {"name": "Invalid", "id": 43}});
        expect(errors).toHaveLength(1);

        errors = validatePayload(rule, {"org": {"country": "US", "name": "Valid"}});
        expect(errors).toHaveLength(0);
    });
})