import HashMap from 'perf-primitives/hash-map';
import FastArray from 'perf-primitives/fast-array';

export default class Frame {

  constructor(name, queueNames) {
    this.name = name;
    this.queueNames = queueNames;
    this.queues = new HashMap();
    this.nonces = new HashMap();

    for (let i = 0; i < queueNames.length; i++) {
      this.queues.set(name, new FastArray());
    }
  }

  addQueue(name, after) {
    if (this.queueNames.indexOf(name) !== -1) {
      return;
    }

    let names = this.queueNames;

    if (after) {
      names.splice(names.indexOf(after) + 1, 0, name);
    } else {
      names.push(name);
    }

    this.queues.set(name, new FastArray());
  }

  push(name, task) {
    this.queues.get(name).push(task);
  }

  flush() {
    this.queues.forEach((queue) => {
      queue.forEach((task) => {
        task._resolve();
      });
    });
  }

}
