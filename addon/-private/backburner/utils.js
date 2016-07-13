const NUMBER = /\d+/;

export function each(collection, callback) {
  for (var i = 0; i < collection.length; i++) {
    callback(collection[i]);
  }
}

export function isNullOrUndefined(suspect) {
  return suspect === undefined || suspect === null;
}

export function isBoolean(suspect) {
  return typeof suspect === 'boolean';
}

export function isString(suspect) {
  return typeof suspect === 'string';
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
