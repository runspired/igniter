/* global System */

// polyfill: https://github.com/tc39/proposal-global/blob/master/polyfill.js
(function (global) {
  if (typeof System !== 'object') {
    global.System = {};
  }
  if (!System.global) {
    System.global = global;
  }
})(typeof this === 'object' ? this : Function('return this')());

export const Global = System.global;

const {
  requestAnimationFrame,
  cancelAnimationFrame,
  setTimeout,
  clearTimeout
} = Global;

export {
  requestAnimationFrame,
  cancelAnimationFrame,
  setTimeout,
  clearTimeout
};

export default Global;
