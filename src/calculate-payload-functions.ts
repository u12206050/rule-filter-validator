import { get, isPlainObject, set } from 'lodash-es';
import { functions } from './functions.js';
import type { FieldFunction, Filter } from './types';

/**
 * Inject function output fields into a given payload for accurate validation
 *
 * @param payload Any data payload
 * @param filter A single level filter rule to verify against
 *
 * @example
 * ```js
 * const input = { date: '2022-03-29T11:37:56Z' };
 * const filter = { 'year(date)': { _eq: 2022 }}
 * const output = applyFunctions(input, filter);
 * // { date: '2022-03-29T11:37:56Z', 'year(date)': 2022 }
 * ```
 */
export function calculatePayloadFunctions(payload: Record<string, any>, filter: Filter) {

	processFilterLevel(filter);

	return payload;

	function processFilterLevel(filter: Filter, parentPath?: string) {
		for (const [key, value] of Object.entries(filter)) {
			const path = parentPath ? parentPath + '.' + key : key;

			if (key.startsWith('_') === false && isPlainObject(value)) {
				processFilterLevel(value, path);
			}

      if (Array.isArray(value) && (key === '_and' || key === '_or')) {
        for (const filter of value) {
          processFilterLevel(filter, parentPath);
        }
        continue;
      }

      if (key.includes('(') && key.includes(')')) {
				const functionName = key.split('(')[0] as FieldFunction;
				const fieldKey = key.match(/\(([^)]+)\)/)?.[1];
				if (!fieldKey || !functionName) continue;
				const currentValuePath = parentPath ? parentPath + '.' + fieldKey : fieldKey;
				const currentValue = get(payload, currentValuePath);

        const currentPayloadPath = parentPath ? parentPath + '.' + key : key;
				set(payload, currentPayloadPath, functions[functionName](currentValue));
			}
		}
	}
}
