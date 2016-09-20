import clock from '../timers/clock';
import Token from '../tokens';

import {
  isFunction,
  isBoolean,
  isNullOrUndefined,
  isCoercableNumber
} from './utils';

export default class Backburner {
  constructor(engine) {
    this.engine = engine;
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

      this.engine.schedule('actions', job, ...args);
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
    let target;
    let method;
    let ignoreArg;

    // do we straight up have a method?
    if (isFunction(potentialMethodOrIgnore)) {
      target = potentialTargetOrMethod;
      method = potentialMethodOrIgnore;

      // do we have a string method and a target?
    } else if (isNullOrUndefined(potentialTargetOrMethod)) {
      if (isFunction(potentialTargetOrMethod[potentialMethodOrIgnore])) {
        target = potentialTargetOrMethod;
        method = potentialTargetOrMethod[potentialMethodOrIgnore];
      } else {
        // method is neither a function nor a string resolving to a function
        // and our target is null or undefined
        throw new Error('Invalid Function Definition');
      }

      // do we have a straight up method as the first arg?
    } else if (isFunction(potentialTargetOrMethod)) {
      target = undefined;
      method = potentialTargetOrMethod;
      ignoreArg = potentialMethodOrIgnore;

      // we have no function at all
    } else {
      throw new Error('Invalid Function Definition');
    }

    return [
      method.bind(target),
      ignoreArg
    ];
  }

  static buildWrappedFunctionCall(potentialTargetOrMethod, potentialMethodOrIgnore, engine) {
    let [method, ignoreArg] = Backburner.buildFunctionCall(potentialTargetOrMethod, potentialMethodOrIgnore);
    let fn = (...args) => {
      engine.schedule('actions', method, ...args);
    };

    return [fn, ignoreArg];
  }

  later(...args) {
    let { length } = args;
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
      [method, wait] = Backburner.buildWrappedFunctionCall(methodOrTarget, methodOrArg, this.engine);

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

    [method, firstArg] = Backburner.buildWrappedFunctionCall(methodOrTarget, methodOrArg, this.engine);

    args.shift();
    if (!firstArg) {
      args.shift();
    }

    return clock.schedule(method, wait, ...args);
  }

  destroy() {
    this.engine = null;
    this._choked = null;
  }
}

function executeChokedFunction(backburner, immediate, target, method, ...args) {
  if (!immediate) {
    let job = Backburner.buildFunctionCall(target, method);

    backburner.engine.schedule('actions', job, ...args);
  }

  let index = findItem(target, method, backburner._choked);

  if (index > -1) {
    backburner._choked.splice(index, 1);
  }
}

function findItem(target, method, collection) {
  let item;
  let index = -1;

  for (let i = 0, l = collection.length; i < l; i++) {
    item = collection[i];

    if (item[0] === target && item[1] === method) {
      index = i;
      break;
    }
  }

  return index;
}
