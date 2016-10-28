/*
  @performance

  `binaryTimerSearch` is consistently faster than a `linearTimerSearch`
  even for small arrays (<= 20 items). The speed difference becomes
  more pronounced as the array size grows.

  **Example linearTimerSearch implementation**

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
export default function binaryTimerSearch(time, timers) {
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
