import Promise from 'igniter/-private/promise';

/*
 This requires a test environment with true Promises to work
 at the moment.

 Annoyingly requires us to double schedule. We should figure
 out how to do true stack detection.
 */
export default function(callback) {
  Promise.resolve()
    .then(() => {
      return Promise.resolve()
        .then(() => {
          callback();
        });
    });
}
