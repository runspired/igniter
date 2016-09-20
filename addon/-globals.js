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
  requestAnimationFrame, // jshint ignore:line
  cancelAnimationFrame, // jshint ignore:line
  requestIdleCallback,  // jshint ignore:line
  cancelIdleCallback, // jshint ignore:line
  setTimeout, // jshint ignore:line
  clearTimeout  // jshint ignore:line
} = Global;

export {
  requestAnimationFrame,
  cancelAnimationFrame,
  requestIdleCallback,
  cancelIdleCallback,
  setTimeout,
  clearTimeout
};

export default Global;
