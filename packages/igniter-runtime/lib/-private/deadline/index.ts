/* global performance */

/*
 This is a rough implementation of deadlines as specified
 in https://www.w3.org/TR/requestidlecallback
 */

// See this note: https://www.w3.org/TR/requestidlecallback/#h-note3
export const MAXIMUM_DEADLINE = 50;
import now from '../time/now';

function Deadline(expires) {
  let currentTime = now();
  let msUntil = currentTime - expires;

  if (msUntil > MAXIMUM_DEADLINE) {
    expires = currentTime + MAXIMUM_DEADLINE;
  }

  this._isExpired = false;
  this._expires = expires;
}

Deadline.prototype.timeRemaining = function timeRemaining() {
  let rem = this._expires - now();

  return rem > 0 ? rem : 0;
};

Object.defineProperty(Deadline.prototype, 'didTimeout', {
  configurable: false,
  enumerable: true,
  writeable: false,
  get() {
    if (this._isExpired) {
      return true;
    }

    this._isExpired = now() > this._expires;
    return this._isExpired;
  }
});

export default Deadline;
