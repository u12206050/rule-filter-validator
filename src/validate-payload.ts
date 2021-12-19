import { FieldFilter, Filter } from './types';
import get from 'lodash.get';

/**
 * Validate the payload against the given filter rules
 *
 * @param {Filter} filter - The filter rules to check against
 * @param {Record<string, any>} payload - The payload to validate
 * @returns Array<string> errors if any
 */
export function validatePayload(filter: Filter, payload: Record<string, any>) {
	const errors: string[] = []
	validate(filter, payload, errors, '')
	errors.reverse()

	return errors
}


export function isValid(compareValue: any, fn: string, testValue: any): boolean | null {
	switch (fn) {
		case '_eq': return compareValue === testValue;

		case '_neq': return compareValue !== testValue;

		case '_contains': return testValue.indexOf(compareValue) > -1;

		case '_ncontains': return testValue.indexOf(compareValue) === -1;

		case '_starts_with':
			return String(testValue).startsWith(String(compareValue));

		case '_nstarts_with':
			return ! String(testValue).startsWith(String(compareValue));

		case '_ends_with':
			return String(testValue).endsWith(String(compareValue));

		case '_nends_with':
			return ! String(testValue).endsWith(String(compareValue));

		case '_in': return (compareValue as string[]).join(',').split(',').includes(String(testValue));

		case '_nin': return ! (compareValue as string[]).join(',').split(',').includes(String(testValue));

		case '_gt': return Number.isSafeInteger((compareValue + testValue) * 1) ? Number(testValue) > Number(compareValue) : new Date(testValue) > new Date(compareValue);

		case '_gte': return Number.isSafeInteger((compareValue + testValue) * 1) ? Number(testValue) >= Number(compareValue) : new Date(testValue) >= new Date(compareValue);

		case '_lt': return Number.isSafeInteger((compareValue + testValue) * 1) ? Number(testValue) < Number(compareValue) : new Date(testValue) < new Date(compareValue);

		case '_lte': return Number.isSafeInteger((compareValue + testValue) * 1) ? Number(testValue) <= Number(compareValue) : new Date(testValue) <= new Date(compareValue);

		case '_null': return testValue === null ? compareValue : ! compareValue;

		case '_nnull': return testValue !== null ? compareValue : ! compareValue;

		case '_empty': return Array.isArray(testValue) ? testValue.length === 0 : testValue === '';

		case '_nempty': return Array.isArray(testValue) ? testValue.length > 0 : testValue !== '';

		case '_between':
			if ((compareValue as Array<any>).every((value: any) => Number.isSafeInteger(value * 1))) {
				const [min, max] = compareValue as [number, number]
				return testValue > Number(min) && testValue < Number(max)
			} else {
				const [min, max] = compareValue as [string, string]
				return testValue > min && testValue < max
			}

		case '_nbetween':
			if ((compareValue as Array<any>).every((value: any) => Number.isSafeInteger(value * 1))) {
				const [min, max] = compareValue as [number, number]
				return testValue < Number(min) || testValue > Number(max)
			} else {
				const [min, max] = compareValue as [string, string]
				return testValue < min || testValue > max
			}

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
 * @returns { errors: Array<string> }
 */
function validate(filter: Filter, payload: Record<string, any>, errors: string[] = [], path: any = ''): boolean {
	if (typeof filter !== 'object' && ! filter) {
		throw new Error('Filter rule is not valid')
	}
	return Object.keys(filter).every((key) => {
		const compareValue = get(filter, key) as any;

		if (String(key).startsWith('_')) {
			switch (key) {
				case '_and':
					return (compareValue as Array<FieldFilter>).every(subFilter => validate(subFilter, payload, errors, path))
				case '_or':
					let swallowErrors: string[] = []
					let result = (compareValue as Array<FieldFilter>).some(subFilter => validate(subFilter, payload, swallowErrors, path))
					if (! result) {
						errors.push(swallowErrors.join(' || '))
					}
					return result
			}

			let testValue = get(payload, path, undefined)
			let result = isValid(compareValue, key, testValue)
			if (result !== null) {
				if (! result) {
					errors.push(`Failed: ${path} with ${JSON.stringify(testValue)} does not match ${key} with ${JSON.stringify(compareValue)}`)
				}

				return result
			}
		}

		return validate(compareValue as Filter, payload, errors, [path, key].filter(s => s).join('.'))
	})
}