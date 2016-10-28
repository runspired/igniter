export const Doubled = [];

export function double(context, methodName, replacement) {
  let token = Doubled.length;
  let original = context[methodName];

  context[methodName] = replacement;

  Doubled.push({
    context,
    methodName,
    replacement,
    original
  });

  return token;
}

export function restore(token) {
  let doubled = Doubled[token];

  doubled.context[doubled.methodName] = doubled.original;
}

export function restoreAll() {
  Doubled.forEach((doubled) => {
    doubled.context[doubled.methodName] = doubled.original;
  });
  Doubled.length = 0;
}
