const NUMBER = /\d+/;

export function isNullOrUndefined(suspect) {
  return suspect === undefined || suspect === null;
}

export function isBoolean(suspect) {
  return typeof suspect === 'boolean';
}

export function isFunction(suspect) {
  return typeof suspect === 'function';
}

export function isNumber(suspect) {
  return typeof suspect === 'number';
}

export function isCoercableNumber(number) {
  return isNumber(number) || NUMBER.test(number);
}
