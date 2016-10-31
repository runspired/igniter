/* global System */

// polyfill: https://github.com/tc39/proposal-global/blob/master/polyfill.js
(function(global) {
  if (typeof System !== 'object') {
    global.System = {};
  }
  if (!System.global) {
    System.global = global;
  }
})(typeof this === 'object' ? this : Function('return this')()); // jshint ignore:line

export const Global = System.global;

const {
  setTimeout, // jshint ignore:line
  clearTimeout  // jshint ignore:line
} = Global;

/*
 * It is not permitted to copy the rAF functions off window to another object
 * then call it. Instead create a wrapper to export.
 */
function requestAnimationFrame(cb) {
  return Global.requestAnimationFrame(cb);
}
function cancelAnimationFrame(cb) {
  return Global.cancelAnimationFrame(cb);
}
function requestIdleCallback(cb) {
  return Global.requestIdleCallback(cb);
}
function cancelIdleCallback(cb) {
  return Global.cancelIdleCallback(cb);
}

export {
  requestAnimationFrame,
  cancelAnimationFrame,
  requestIdleCallback,
  cancelIdleCallback,
  setTimeout,
  clearTimeout
};

export default Global;
