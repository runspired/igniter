/*
  Exists just to make it extra easy to test double things.
 */
const IgniterConsole = {
  warn() {
    console.warn.call(console, ...arguments);
  },
  log() {
    console.log.call(console, ...arguments);
  },
  error() {
    console.error.call(console, ...arguments);
  },
  info() {
    console.info.call(console, ...arguments);
  }
};

export default IgniterConsole;
