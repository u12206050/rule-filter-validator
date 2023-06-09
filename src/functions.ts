import { FieldFunction } from "./types";

export const functions: Record<FieldFunction, (val: any) => any> = {
	year,
	month,
	week,
	day,
	hour,
	minute,
	second,
	count,
};

/**
 * Extract the year from a given ISO-8601 date
 */
function year(value: string): number {
  return (new Date(value)).getUTCFullYear();
}

function month(value: string): number {
	// Match DB by using 1-indexed months
	return (new Date(value)).getUTCMonth() + 1;
}

function week(value: string): number {
  const date = new Date(value);
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;

  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function day(value: string): number {
  return (new Date(value)).getUTCDate();
}

function hour(value: string): number {
	return (new Date(value)).getUTCHours();
}

function minute(value: string): number {
	return (new Date(value)).getUTCMinutes();
}

function second(value: string): number {
	return (new Date(value)).getUTCSeconds();
}

function count(value: any): number | null {
	return Array.isArray(value) ? value.length : null;
}