/**
 * Adjust a given date by a given change in duration. The adjustment value uses the exact same syntax
 * and logic as Vercel's `ms`.
 *
 * The conversion is lifted straight from `ms`.
 */
export function adjustDate(date: Date, adjustment: string): Date | undefined {
  date = new Date(date);

  const match =
    /^((?:-|\+)?\d*?\.?\d+?) *?(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mth|mo|years?|yrs?|y)?$/i.exec(
      adjustment.trim()
    );

  if (!match || !match[1]) return;

  const amount = parseFloat(match[1]);
  const type = (match[2] ?? 'days').toLowerCase();

  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      date.setUTCFullYear(date.getUTCFullYear() + amount);
      return date;
    case 'months':
    case 'month':
    case 'mth':
    case 'mo':
      date.setUTCMonth(date.getUTCMonth() + amount);
      return date;
    case 'weeks':
    case 'week':
    case 'w':
      date.setUTCDate(date.getUTCDate() + amount * 7);
      return date;
    case 'days':
    case 'day':
    case 'd':
      date.setUTCDate(date.getUTCDate() + amount);
      return date;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      date.setUTCHours(date.getUTCHours() + amount);
      return date;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      date.setUTCMinutes(date.getUTCMinutes() + amount);
      return date;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      date.setUTCSeconds(date.getUTCSeconds() + amount);
      return date;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      date.setMilliseconds(date.getMilliseconds() + amount);
      return date;
    default:
      return undefined;
  }
}
