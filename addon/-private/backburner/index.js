import clock from '../timers/clock';
import {
  isFunction,
  isNullOrUndefined,
  isCoercableNumber
} from './utils';

export default class Backburner {

  constructor() {

  }

  throttle() {
    throw new Error('timers are not implemented yet!');
  }

  debounce() {
    throw new Error('timers are not implemented yet!');
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
