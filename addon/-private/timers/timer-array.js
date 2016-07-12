import binaryTimerSearch from './binary-timer-search';

export const MACRO_TASK_EXECUTION_ADJUSTMENT = 3;

const now = Date.now;

export default class TimerArray {
  constructor() {
    this.data = [];
  }

  push(executeAt, job) {
    this.data.push(executeAt, job);
  }

  /*
   @method search

   @performance

   a binary search is consistently faster than a linear search
   even for small arrays (<= 20 items). The speed difference becomes
   more pronounced as the array size grows.

   **Example linear search implementation**

   ```js
   function linearTimerSearch(time, timers) {
     let length = timers.length;

     for (let i = 0; i < length; i+=2) {
       if (time <= timers[i]) {
         return i;
       }
     }

     return length;
   }
   ```
   */
  search(time) {
    let timers = this.data;
    let start = 0;
    let end = timers.length - 2;
    let middle, l;

    while (start < end) {
      // since timers is an array of pairs 'l' will always
      // be an integer
      l = (end - start) / 2;

      // compensate for the index in case even number
      // of pairs inside timers
      middle = start + l - (l % 2);

      if (time >= timers[middle]) {
        start = middle + 2;
      } else {
        end = middle;
      }
    }

    return (time >= timers[start]) ? start + 2 : start;
  }

  insert(time, job) {
    let arr = this.data;
    let insertionIndex = this.search(time);

    arr.splice(insertionIndex, 0, time, job);

    return insertionIndex;
  }

  flushExpired() {
    let now = Date.now() + MACRO_TASK_EXECUTION_ADJUSTMENT;
    let timers = this.data;
    let i = 0;
    let length = timers.length;

    for (; i < length; i += 2) {
      let executeAt = timers[i];
      let fn = timers[i + 1];

      if (executeAt <= now) {
        fn();
      } else {
        break;
      }
    }

    timers.splice(0, i);
  }
}
