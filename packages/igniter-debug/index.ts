import console from './lib/console';

export {
  console
};

/*
  Statements wrapped in this method will be stripped from
  all builds that are not explicitly `development`.
 */
export function developModeOnly(cb) {
  cb();
}

export function instrument(cb) {
  cb();
}

/*
  All asserts will be stripped from builds that are explicitly
  `production`.
 */
export function assert(message, test) {
  if (!test) {
    throw new Error(message);
  }
}

export function warn(message) {
  console.warn(message);
}

export function debug() {
  console.log(...arguments);
}

export let DEPRECATIONS = {};

/*
  Useful when testing deprecations
 */
export function _clearDeprecations() {
  DEPRECATIONS = {};
}

export function conditionalDeprecation(message, options, test) {
  if (!test) {
    deprecate(message, options);
  }
}

export function deprecate(message, options = {}) {
  assert(`You must supply an 'id' for the deprecation in the options passed to deprecate`, options.id);
  assert(`You must supply a 'since' version for the deprecation in the options passed to deprecate`, options.since);
  assert(`You must supply an 'until' version for the deprecation in the options passed to deprecate`, options.until);

  let fullMessage;

  if (DEPRECATIONS[options.id]) {
    DEPRECATIONS[options.id].count++;
    return;
  } else {
    fullMessage = `DEPRECATION: ${message} [deprecation id: ${options.id}, since: ${options.since}, until: ${options.until}]`;

    DEPRECATIONS[options.id] = {
      fullMessage,
      message,
      options,
      count: 1
    };
  }

  console.warn(fullMessage);
}
