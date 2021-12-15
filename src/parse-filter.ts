import get from 'lodash.get';
import {FilterContext, Filter} from './types';
import { toArray } from './to-array';
import { adjustDate } from './adjust-date';

export const parseFilter = (
	filter: Filter,
	context: FilterContext = {}
): Filter => {
	return Object.entries(filter).reduce((result: Filter, entry) => {
		const key: string = String(entry[0]);
		const value = entry[1]
		if (['_or', '_and'].includes(key)) {
			// @ts-ignore
			result[key] = (value as Filter[]).map((filter: Filter) => parseFilter(filter, context));
		} else if (['_in', '_nin', '_between', '_nbetween'].includes(key)) {
			// @ts-ignore
			result[key] = toArray(value).flatMap((value) => parseFilterValue(value, context));
		} else if (key.startsWith('_')) {
			// @ts-ignore
			result[key] = parseFilterValue(value, context);
		} else {
			// @ts-ignore
			result[key] = parseFilter(value as Filter, context);
		}
		return result;
	}, {}) as Filter;
}

function parseFilterValue(value: any, context: FilterContext) {
	if (value === 'true') return true;
	if (value === 'false') return false;
	if (value === 'null' || value === 'NULL') return null;
	if (typeof value === 'string' && value.startsWith('$')) return parseDynamicVariable(value, context);
	return value;
}

function parseDynamicVariable(value: any, context: FilterContext) {
	if (value.startsWith('$NOW')) {
		if (value.includes('(') && value.includes(')')) {
			const adjustment = value.match(/\(([^)]+)\)/)?.[1];
			if (!adjustment) return new Date();
			return adjustDate(new Date(), adjustment);
		}

		return new Date();
	}

	return get(context, value, value);
}