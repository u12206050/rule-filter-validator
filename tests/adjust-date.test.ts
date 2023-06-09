import { adjustDate } from '../src/adjust-date';

describe('adjustDate', () => {
  it('should handle adjustments in milliseconds', () => {
    const date = new Date('2023-08-01T00:00:00.000Z');
    const adjustment = '500ms';
    const expectedDate = new Date('2023-08-01T00:00:00.500Z');
    expect(adjustDate(date, adjustment)).toEqual(expectedDate);
  });

  it('should handle adjustments in seconds', () => {
    const date = new Date('2023-08-01T00:00:00.000Z');
    const adjustment = '30s';
    const expectedDate = new Date('2023-08-01T00:00:30.000Z');
    expect(adjustDate(date, adjustment)).toEqual(expectedDate);
  });

  it('should handle adjustments in minutes', () => {
    const date = new Date('2023-08-01T00:00:00.000Z');
    const adjustment = '15mins';
    const expectedDate = new Date('2023-08-01T00:15:00.000Z');
    expect(adjustDate(date, adjustment)).toEqual(expectedDate);
  });

  it('should handle adjustments in hours', () => {
    const date = new Date('2023-08-01T00:00:00.000Z');
    const adjustment = '5h';
    const expectedDate = new Date('2023-08-01T05:00:00.000Z');
    expect(adjustDate(date, adjustment)).toEqual(expectedDate);
  });

  it('should handle adjustments in days', () => {
    const date = new Date('2023-08-01T00:00:00.000Z');
    const adjustment = '-10d';
    const expectedDate = new Date('2023-07-22T00:00:00.000Z');
    expect(adjustDate(date, adjustment)).toEqual(expectedDate);
  });

  it('should handle adjustments in weeks', () => {
    const date = new Date('2023-08-01T00:00:00.000Z');
    const adjustment = '2w';
    const expectedDate = new Date('2023-08-15T00:00:00.000Z');
    expect(adjustDate(date, adjustment)).toEqual(expectedDate);
  });

  it('should handle adjustments in months', () => {
    const date = new Date('2023-08-01T00:00:00.000Z');
    const adjustment = '3 months';
    const expectedDate = new Date('2023-11-01T00:00:00.000Z');
    expect(adjustDate(date, adjustment)).toEqual(expectedDate);
  });

  it('should handle adjustments in years', () => {
    const date = new Date('2023-08-01T00:00:00.000Z');
    const adjustment = '-7y';
    const expectedDate = new Date('2016-08-01T00:00:00.000Z');
    expect(adjustDate(date, adjustment)).toEqual(expectedDate);
  });

  it('should return undefined for invalid adjustments', () => {
    const date = new Date('2023-08-01T00:00:00.000Z');
    const adjustment = 'foobar';
    expect(adjustDate(date, adjustment)).toBeUndefined();
  });
});
