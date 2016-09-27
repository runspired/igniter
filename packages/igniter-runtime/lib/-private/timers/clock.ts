/* global Math */
import { setTimeout, clearTimeout } from '../../-globals';
import TimerArray from './timer-array';
import Token from '../tokens';
const { now } = Date;

function wrapForTimer(work, token) {
  return function checkForCancelled() {
    if (!token.cancelled) {
      work();
    }
  };
}

export class Clock {
  constructor() {
    this.timers = new TimerArray();
    this.boundFlush = this._flush.bind(this);
    this.nextMacroTask = undefined;
  }

  /*
    @method schedule

    `Clock.schedule` allows you to push in a new `method`
    to be executed once `wait` has passed.
   */
  schedule(method, wait, ...args) {
    wait = wait || 0;
    let executeAt = now() + wait;
    let token = new Token();
    let work = method;

    if (args.length) {
      work = work.bind(undefined, ...args);
    }

    let job = wrapForTimer(work, token);

    // push a new timeout if we don't have one
    if (this.timers.length === 0) {
      this.timers.push(executeAt, job);
      this.nextMacroTask = setTimeout(this.boundFlush, wait);
      return token;
    }

    let insertionIndex = this.timers.insert(executeAt, job);

    // we should be the new earliest timer
    if (insertionIndex === 0) {
      clearTimeout(this.nextMacroTask);
      this.nextMacroTask = setTimeout(this.boundFlush, wait);
    }

    return token;
  }

  forget(token) {
    token.cancelled = true;
  }

  /*
    @method flush

    Flushes expired jobs after clearing the current macroTask timeout
   */
  flush() {
    clearTimeout(this.nextMacroTask);
    this._flush();
  }

  /*
    @method _flush

    executes any expired jobs (jobs with an `executeAt` that is prior
    to or equal to the current time).
   */
  _flush() {
    this.timers.flushExpired();

    if (this.timers.length > 0) {
      let [executeAt] = this.timers;
      let wait = Math.max(0, executeAt - now());

      this.nextMacroTask = setTimeout(this.boundFlush, wait);
    }

  }
}

export default new Clock();
