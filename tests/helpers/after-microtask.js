
/*
 This requires a test environment with true Promises to work
 at the moment.
 */
export default function(callback) {
  Promise.resolve()
    .then(callback);
}
