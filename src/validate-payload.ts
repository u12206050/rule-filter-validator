import { FieldFilter, Filter } from './types';
import get from 'lodash.get';
import { parseDate } from './adjust-date';
import { parseFilter } from './parse-filter';

/**
 * Validate the payload against the given filter rules
 *
 * @param {Filter} filter - The filter rules to check against
 * @param {Record<string, any>} payload - The payload to validate
 * @param {boolean} strict(false) - Type and Case-sensitive validation
 * @returns Array<string> errors if any
 */
export function validatePayload(filter: Filter, payload: Record<string, any>, strict = false) {
	const errors: string[] = []
	validate(parseFilter(filter), payload, errors, '', strict)
	errors.reverse()

	return errors
}

export function isValid(compareValue: any, fn: string, testValue: any, strict = false): boolean | null {
	// When not strict convert all strings and numbers to UPPERCASE strings before comparing
	const strictValue = (value: any) => strict ? value : String(value).toUpperCase()
	const strictString = (value: any) => strictValue(String(value))
	const strictArray = (value: Array<any>) => strict ? value : strictValue((value as string[]).join(',')).split(',')

	switch (fn) {
		case '_eq': return strictValue(compareValue) === strictValue(testValue);

		case '_neq': return strictValue(compareValue) !== strictValue(testValue);

		case '_contains': return strictString(testValue).indexOf(strictString(compareValue)) > -1;

		case '_ncontains': return strictString(testValue).indexOf(strictString(compareValue)) === -1;

		case '_starts_with':
			return strictString(testValue).startsWith(strictString(compareValue))

		case '_nstarts_with':
			return ! strictString(testValue).startsWith(strictString(compareValue))

		case '_ends_with':
			return strictString(testValue).endsWith(strictString(compareValue))

		case '_nends_with':
			return ! strictString(testValue).endsWith(strictString(compareValue))

		case '_in': return strictArray(compareValue).includes(strictValue(testValue));

		case '_nin': return ! strictArray(compareValue).includes(strictValue(testValue));

		case '_gt': return Number.isSafeInteger((compareValue + testValue) * 1) ? Number(testValue) > Number(compareValue) : new Date(testValue) > new Date(compareValue);

		case '_gte': return Number.isSafeInteger((compareValue + testValue) * 1) ? Number(testValue) >= Number(compareValue) : new Date(testValue) >= new Date(compareValue);

		case '_lt': return Number.isSafeInteger((compareValue + testValue) * 1) ? Number(testValue) < Number(compareValue) : new Date(testValue) < new Date(compareValue);

		case '_lte': return Number.isSafeInteger((compareValue + testValue) * 1) ? Number(testValue) <= Number(compareValue) : new Date(testValue) <= new Date(compareValue);

		case '_null': return testValue === null ? compareValue : ! compareValue;

		case '_nnull': return testValue !== null ? compareValue : ! compareValue;

		case '_empty': return Array.isArray(testValue) ? testValue.length === 0 : testValue === '';

		case '_nempty': return Array.isArray(testValue) ? testValue.length > 0 : testValue !== '';

		case '_between':
			return isValid(compareValue[0], '_gte', testValue, strict) && isValid(compareValue[1], '_lte', testValue, strict)
		case '_nbetween':
			return isValid(compareValue[0], '_lt', testValue, strict) || isValid(compareValue[1], '_gt', testValue, strict)

		case '_submitted': return (typeof testValue !== 'undefined' ? compareValue : ! compareValue) as boolean;

		case '_regex':
			const regex = compareValue as string
			const wrapped = regex.startsWith('/') && regex.endsWith('/');
			const regResult = new RegExp(wrapped ? regex.slice(1, -1) : regex).exec(testValue)
			return regResult ? regResult.length > 0 : false

		default : return null
	}
}

/**
 * Validate the payload against the given filter rules
 *
 * @param {Filter} filter - The filter rules to check against
 * @param {Record<string, any>} payload - The payload to validate
 * @param errors
 * @param {string} path - Optional options to pass to Joi
 * @param {boolean} strict(false) - Type and Case-sensitive validation
 * @returns { errors: Array<string> }
 */
function validate(filter: Filter, payload: Record<string, any>, errors: string[] = [], path: any = '', strict = false): boolean {
	if (typeof filter !== 'object' && ! filter) {
		throw new Error('Filter rule is not valid')
	}
	return Object.keys(filter).every((key) => {
		const compareValue = get(filter, key) as any;

		if (String(key).startsWith('_')) {
			switch (key) {
				case '_and':
					return (compareValue as Array<FieldFilter>).every(subFilter => validate(subFilter, payload, errors, path, strict))
				case '_or':
					let swallowErrors: string[] = []
					let result = (compareValue as Array<FieldFilter>).some(subFilter => validate(subFilter, payload, swallowErrors, path, strict))
					if (! result) {
						errors.push(swallowErrors.join(' || '))
					}
					return result
			}

			let testValue = get(payload, path, undefined)
			let result = isValid(compareValue, key, testValue, strict)
			if (result !== null) {
				if (! result) {
					errors.push(`Failed: ${path} with ${JSON.stringify(testValue)} does not match ${key} with ${JSON.stringify(compareValue)}`)
				}

				return result
			}
		}

		return validate(compareValue as Filter, payload, errors, [path, key].filter(s => s).join('.'), strict)
	})
}