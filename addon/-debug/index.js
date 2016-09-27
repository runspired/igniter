/*
  Statements wrapped in this method will
  be stripped from builds that are explicitly `production`
 */
export function stripInProduction(cb) {
  cb();
}

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
export function assert(message, cb) {
  if (!cb) {
    throw new Error(message);
  }
}

export function warn(message) {
  console.warn(message);
}

export function debug() {
  console.log(...arguments);
}

export function deprecate(message) {
  console.warn(message);
}
