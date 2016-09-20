/* global process, performance, Date, Math */
import Ember from 'ember';

// It turns out to be nicer for perf to bind than to close over the time method
// however, when testing we need to be able to stub the clock via the global
// so we use this boolean to determine whether we "bind" or use a wrapper function.
const {
  testing: IS_TESTING
} = Ember;

export let now;
export let format;
export let ORIGIN_TIME;

if (typeof performance === 'object' && typeof performance.now === 'function') {
  now = IS_TESTING ?
    function now() {
      return performance.now();
    } : performance.now.bind(performance);
  format = 'milli';
} else if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
  now = function now() {
    let time = process.hrtime();
    return time[0] * 1e9 + time[1];
  };
  format = 'hrtime';
} else {
  ORIGIN_TIME = Date.now();
  now = function now() {
    return Math.floor(Date.now() - ORIGIN_TIME * 1e6);
  };
  format = 'timestamp';
}

export function normalizeTime(time, fmt = format) {
  switch (fmt) {
    case 'milli':
      return milliToNano(time);
    case 'hrtime':
      return timeFromHRTime(time);
    case 'timestamp':
      return milliToNano(time - ORIGIN_TIME);
    default:
      throw new Error('Unknown Format');
  }
}

export function milliToNano(time) {
  return Math.floor(time * 1e6);
}

export function timeFromHRTime(time) {
  return time[0] * 1e9 + time[1];
}

export default now;
