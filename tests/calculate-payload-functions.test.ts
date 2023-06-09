import { calculatePayloadFunctions } from '../src/calculate-payload-functions';

describe('calculatePayloadFunctions', () => {
	it('Passes the original object unchanged if no filter rules apply', () => {
		const input = { date: '2022-03-30T09:36:27Z' };
		const filter = {};
		const output = calculatePayloadFunctions(input, filter);
		expect(output).toEqual(input);
	});

	// TODO: better to have it deep clone, but then we have issue with proxies
	/*it(`Doesn't modify the original object`, () => {
		const input = { date: '2022-03-30T09:36:27Z' };
		const filter = { 'year(date)': { _eq: 2022 } };
		const output = calculatePayloadFunctions(input, filter);
		expect(output).not.toBe(input);
	});*/

	it(`Skips over filter rules with unknown fieldkeys or function names`, () => {
		const input = { date: '2022-03-30T09:36:27Z' };

		const filter = { '()': 'wrong', 'another()': 'wrong' } as any;

		const output = calculatePayloadFunctions(input, filter);
		expect(output).toEqual(input);
	});

	it(`Recursively loops over filter and injects results`, () => {
		const input = {
			date: '2022-03-30T09:36:27Z',
			nested: {
				anotherDate: '2022-03-30T09:36:27Z',
			},
		};

		const filter = {
			'year(date)': {
				_eq: 2022,
			},
			nested: {
				'month(anotherDate)': {
					_lte: 3,
				},
			},
		};

		const output = calculatePayloadFunctions(input, filter);

		expect(output).toEqual({
			date: '2022-03-30T09:36:27Z',
			'year(date)': 2022,
			nested: {
				anotherDate: '2022-03-30T09:36:27Z',
				'month(anotherDate)': 3,
			},
		});
	});
});