import clock from '../timers/clock';
import Token from '../tokens';

import {
  isFunction,
  isBoolean,
  isNullOrUndefined,
  isCoercableNumber
} from './utils';

export default class Backburner {

  constructor() {
    this._choked = [];
  }

  throttle(...args) {
    return this._choke(false, ...args);
  }

  debounce(...args) {
    return this._choke(true, ...args);
  }

  _choke(updateExpireTime, target, method, ...args) {
    let immediate = false;
    let wait = args.pop();
    let index;
    let reference;
    let timer;

    if (isBoolean(wait)) {
      immediate = wait;
      wait = args.pop();
      immediate = false;
    }

    wait = parseInt(wait, 10);

    // Remove debouncee if present
    index = findItem(target, method, this._choked);

    if (index > -1) {
      if (!updateExpireTime) {
        return;
      }

      reference = this._choked[index];
      this._choked.splice(index, 1);
      clock.forget(reference[2]);
    }

    timer = clock.schedule(executeChokedFunction, wait, this, immediate, target, method, ...args);

    if (immediate && index === -1) {
      let job = Backburner.buildFunctionCall(target, method);

      job.call(undefined, ...args);
    }

    reference = [
      target,
      method,
      timer
    ];

    this._choked.push(reference);

    return timer;
  }

  static buildFunctionCall(potentialTargetOrMethod, potentialMethodOrIgnore) {
    if (isFunction(potentialMethodOrIgnore)) {
      return [
        potentialMethodOrIgnore.bind(potentialTargetOrMethod)
      ];
    }

    // target is not null
    if (isNullOrUndefined(potentialTargetOrMethod)) {
      if (isFunction(potentialTargetOrMethod[potentialMethodOrIgnore])) {
        return [
          potentialTargetOrMethod[potentialMethodOrIgnore].bind(potentialTargetOrMethod)
        ];
      }

      // method is neither a function nor a string resolving to a function
      // and our target is null or undefined
      throw new Error('Invalid Function Definition');
    }

    if (isFunction(potentialTargetOrMethod)) {
      return [
        potentialTargetOrMethod,
        potentialMethodOrIgnore
      ];
    }

    // we have no function at all
    throw new Error('Invalid Function Definition');
  }

  later(...args) {
    let length = args.length;
    let method;
    let wait;
    let firstArg;
    let [methodOrTarget, methodOrArg] = args;

    if (length === 0) {
      return;
    }

    if (length === 1) {
      method = args[0];
      wait = 0;

      return clock.schedule(method, wait);
    }

    if (length === 2) {
      [method, wait] = Backburner.buildFunctionCall(methodOrTarget, methodOrArg);

      if (!wait || !isCoercableNumber(wait)) {
        wait = 0;
      }

      return clock.schedule(method, wait);
    }

    // when we have more than 2 args, we've got to do some extra sniffing
    let lastArgIndex = args[length - 1];

    if (isCoercableNumber(lastArgIndex)) {
      wait = args.pop();
    } else {
      wait = 0;
    }

    [method, firstArg] = Backburner.buildFunctionCall(methodOrTarget, methodOrArg);

    args.shift();
    if (!firstArg) {
      args.shift();
    }

    return clock.schedule(method, wait, ...args);
  }
}

function executeChokedFunction(backburner, immediate, target, method, ...args) {
  if (!immediate) {
    let job = Backburner.buildFunctionCall(target, method);

    job.call(undefined, ...args);
  }

  let index = findItem(target, method, backburner._choked);

  if (index > -1) {
    backburner._choked.splice(index, 1);
  }
}

function findItem(target, method, collection) {
  var item;
  var index = -1;

  for (let i = 0, l = collection.length; i < l; i++) {
    item = collection[i];

    if (item[0] === target && item[1] === method) {
      index = i;
      break;
    }
  }

  return index;
}
