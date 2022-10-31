import { FieldFilter, FieldFilterOperator, Filter } from './types';
import get from 'lodash.get';
import { parseFilter } from './parse-filter';

const FieldFilterText: Record<keyof FieldFilterOperator, string> = {
	_eq: 'equal to',
	_neq: 'not equal to',
	_contains: 'contains',
	_ncontains: 'does not contain',
	_starts_with: 'starts with',
	_nstarts_with: 'does not start with',
	_ends_with: 'ends with',
	_nends_with: 'does not end with',
	_in: 'in',
	_nin: 'not in',
	_between: 'between',
	_nbetween: 'not between',
	_gt: 'greater than',
	_gte: 'greater than or equal to',
	_lt: 'less than',
	_lte: 'less than or equal to',
	_null: 'null =',
	_nnull: 'not null =',
	_empty: 'empty =',
	_nempty: 'not empty =',
	_submitted: 'submitted =',
	_regex: 'matching regex',
}

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

	function safeCompare(a: any, b: any, cb: (A: any, B: any) => boolean) {
		let A: any = Number(a*1)
		let B: any = Number(b*1)

		if (Number.isSafeInteger(A) && Number.isSafeInteger(B)) {
			return cb(A, B)
		}

		A = new Date(a)
		B = new Date(b)
		
		if (A.toString() !== 'Invalid Date' && B.toString() !== 'Invalid Date') {
			return cb(A, B)
		}

		return cb(strictValue(a), strictValue(b))	
	}

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

		case '_gt': return safeCompare(compareValue, testValue, (cv, tv) => tv > cv);

		case '_gte': return safeCompare(compareValue, testValue, (cv, tv) => tv >= cv);

		case '_lt': return safeCompare(compareValue, testValue, (cv, tv) => tv < cv);

		case '_lte': return safeCompare(compareValue, testValue, (cv, tv) => tv <= cv);

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
						// If errors then will be false if all checks fail thus &&
						errors.push(swallowErrors.join(' and '))
					}
					return result
			}

			let testValue = get(payload, path, undefined)
			let result = isValid(compareValue, key, testValue, strict)
			if (result !== null) {
				if (! result) {
					errors.push(`Failed: ${path.split('.').reverse().join(' of ')} is ${JSON.stringify(testValue)} and is not ${FieldFilterText[key as keyof FieldFilterOperator]} ${JSON.stringify(compareValue)}`);
				}

				return result
			}
		}

		return validate(compareValue as Filter, payload, errors, [path, key].filter(s => s).join('.'), strict)
	})
}