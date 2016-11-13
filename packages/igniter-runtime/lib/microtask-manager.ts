import FastArray from './perf-primitives/fast-array';
import Promise from './-private/promise';

function K() {}

export class MicroTaskManager {
  _nextFlush: Promise;
  _jobs: FastArray;

  constructor() {
    this._nextFlush = undefined;
    this._jobs = new FastArray();
  }

  schedule(job): any {
    if (this._nextFlush === undefined) {
      this._scheduleFlush();
    }

    return this._jobs.push(job);
  }

  _scheduleFlush(): void {
    this._nextFlush = Promise.resolve()
      .then(() => {
        this._flush();
      });
  }

  _flush(): void {
    this._jobs.emptyEach((job) => {
      job.call(undefined);
    });

    this._nextFlush = undefined;
  }

  cancel(id): void {
    this._jobs.set(id, K);
  }
}

export const manager = new MicroTaskManager();

export function setMicroTask(job) {
  return manager.schedule(job);
}

export function clearMicroTask(id) {
  manager.cancel(id);
}
