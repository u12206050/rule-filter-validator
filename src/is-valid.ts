/* eslint-disable no-case-declarations */
export function isValid(
  compareValue: any,
  fn: string,
  testValue: any,
  strict = false
): boolean | null {
  // When not strict convert all strings and numbers to UPPERCASE strings before comparing
  const strictValue = (value: any) =>
    strict ? value : String(value).toUpperCase();
  const strictString = (value: any) => strictValue(String(value));
  const strictArray = (value: Array<any>) =>
    strict ? value : strictValue((value as string[]).join(',')).split(',');

  function safeCompare(a: any, b: any, cb: (A: any, B: any) => boolean) {
    let A: any = Number(a * 1);
    let B: any = Number(b * 1);

    if (Number.isSafeInteger(A) && Number.isSafeInteger(B)) {
      return cb(A, B);
    }

    A = new Date(a);
    B = new Date(b);

    if (A.toString() !== 'Invalid Date' && B.toString() !== 'Invalid Date') {
      return cb(A, B);
    }

    return cb(strictValue(a), strictValue(b));
  }

  switch (fn) {
    case '_eq':
      return strictValue(compareValue) === strictValue(testValue);

    case '_neq':
      return strictValue(compareValue) !== strictValue(testValue);

    case '_contains':
      return strictString(testValue).indexOf(strictString(compareValue)) > -1;

    case '_ncontains':
      return strictString(testValue).indexOf(strictString(compareValue)) === -1;

    case '_starts_with':
      return strictString(testValue).startsWith(strictString(compareValue));

    case '_nstarts_with':
      return !strictString(testValue).startsWith(strictString(compareValue));

    case '_ends_with':
      return strictString(testValue).endsWith(strictString(compareValue));

    case '_nends_with':
      return !strictString(testValue).endsWith(strictString(compareValue));

    case '_in':
      return strictArray(compareValue).includes(strictValue(testValue));

    case '_nin':
      return !strictArray(compareValue).includes(strictValue(testValue));

    case '_gt':
      return safeCompare(compareValue, testValue, (cv, tv) => tv > cv);

    case '_gte':
      return safeCompare(compareValue, testValue, (cv, tv) => tv >= cv);

    case '_lt':
      return safeCompare(compareValue, testValue, (cv, tv) => tv < cv);

    case '_lte':
      return safeCompare(compareValue, testValue, (cv, tv) => tv <= cv);

    case '_null':
      return testValue === null ? compareValue : !compareValue;

    case '_nnull':
      return testValue !== null ? compareValue : !compareValue;

    case '_empty':
      return Array.isArray(testValue)
        ? testValue.length === 0
        : testValue === '';

    case '_nempty':
      return Array.isArray(testValue) ? testValue.length > 0 : testValue !== '';

    case '_between':
      return (
        isValid(compareValue[0], '_gte', testValue, strict) &&
        isValid(compareValue[1], '_lte', testValue, strict)
      );
    case '_nbetween':
      return (
        isValid(compareValue[0], '_lt', testValue, strict) ||
        isValid(compareValue[1], '_gt', testValue, strict)
      );

    case '_submitted':
      return (
        typeof testValue !== 'undefined' ? compareValue : !compareValue
      ) as boolean;

    case '_regex':
      const regex = compareValue as string;
      const wrapped = regex.startsWith('/') && regex.endsWith('/');
      const regResult = new RegExp(wrapped ? regex.slice(1, -1) : regex).exec(
        testValue
      );
      return regResult ? regResult.length > 0 : false;

    default:
      return null;
  }
}
