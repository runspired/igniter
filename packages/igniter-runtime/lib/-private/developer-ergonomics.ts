/*
  Statements wrapped in this method will be stripped from
  all builds that are not explicitly `development`.
 */
export function developModeOnly(cb) {
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
