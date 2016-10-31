/*
  Exists just to make it extra easy to test double things.
 */
const IgniterConsole = {
  warn(...args) {
    console.warn.call(console, ...args);
  },
  log(...args) {
    console.log.call(console, ...args);
  },
  error(...args) {
    console.error.call(console, ...args);
  },
  info(...args) {
    console.info.call(console, ...args);
  }
};

export default IgniterConsole;
