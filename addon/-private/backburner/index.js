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
    this.tokenMap = new WeakMap();
    this.debouncees = [];
  }

  throttle() {
    throw new Error('timers are not implemented yet!');
  }

  debounce(target, method, ...args) {
    let immediate = false;
    let wait = args.pop();
    let index;
    let debouncee;
    let timer;

    if (isBoolean(wait)) {
      immediate = wait;
      wait = args.pop();
      immediate = false;
    }

    wait = parseInt(wait, 10);

    // Remove debouncee if present
    index = findDebouncee(target, method, this.debouncees);

    if (index > -1) {
      debouncee = this.debouncees[index];
      this.debouncees.splice(index, 1);
      clock.forget(debouncee[2]);
    }

    timer = clock.schedule(executeDebouncee, wait, this, immediate, target, method, ...args);

    if (immediate && index === -1) {
      let job = Backburner.buildFunctionCall(target, method);

      job.call(undefined, ...args);
    }

    debouncee = [
      target,
      method,
      timer
    ];

    this.debouncees.push(debouncee);

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

function executeDebouncee(backburner, immediate, target, method, ...args) {
  if (!immediate) {
    let job = Backburner.buildFunctionCall(target, method);

    job.call(undefined, ...args);
  }

  let index = findDebouncee(target, method, backburner.debouncees);

  if (index > -1) {
    backburner.debouncees.splice(index, 1);
  }
}

function findDebouncee(target, method, debouncees) {
  return findItem(target, method, debouncees);
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
