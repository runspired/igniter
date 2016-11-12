const NUMBER = /\d+/;

export function isNullOrUndefined(suspect): boolean {
  return suspect === undefined || suspect === null;
}

export function isBoolean(suspect): boolean {
  return typeof suspect === 'boolean';
}

export function isFunction(suspect): boolean {
  return typeof suspect === 'function';
}

export function isNumber(suspect): boolean {
  return typeof suspect === 'number';
}

export function isCoercableNumber(number): boolean {
  return isNumber(number) || NUMBER.test(number);
}
