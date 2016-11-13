import HashMap from '../perf-primitives/hash-map';
import FastArray from '../perf-primitives/fast-array';
import { createWrappedTask } from './task';
import Token from 'cancellation-token';

export default class Phase {
  name: string;
  queueNames: Array<string>;
  queues: HashMap;
  nonces: HashMap;

  constructor(name, queueNames) {
    this.name = name;
    this.queueNames = queueNames;
    this.queues = new HashMap();
    this.nonces = new HashMap();

    for (let i = 0; i < queueNames.length; i++) {
      this.queues.set(queueNames[i], new FastArray());
    }
  }

  addQueue(name, after): void {
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

  push(name, job): Token {
    let token = new Token();
    let work = createWrappedTask(job, token);
    this.queues.get(name).push(work);

    return token;
  }

  flush(): number {
    let jobs = 0;
    this.queueNames.forEach((queueName) => {
      let queue = this.queues.get(queueName);
      jobs += queue.length;
      queue.emptyEach((task) => {
        task();
      });
    });
    return jobs;
  }

  clear(): void {
    this.queues.forEach((queue) => {
      queue.emptyEach(() => {});
    });
  }

  destroy(): void {
    this.clear();
    this.queues = null;
    this.nonces = null;
    this.queueNames = null;
  }
}
