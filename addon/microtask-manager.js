import HashMap from 'perf-primitives/hash-map';
import { Promise } from './-private/task';

const MICRO_PREFIX = '-micro-';
let MICRO_ID = 0;

export class MicroTaskManager {
  constructor() {
    this._nextFlush = undefined;
    this._jobs = undefined;
  }

  schedule(job) {
    let id = `${MICRO_PREFIX}${MICRO_ID++}`;

    if (!this._nextFlush) {
      this._scheduleFlush();
    }

    this._jobs.set(id, job);

    return id;
  }

  _scheduleFlush() {
    this._nextFlush = Promise.resolve()
      .then(() => { this._flush(); });
    this._jobs = new HashMap();
  }

  _flush() {
    this._jobs.forEach((job) => {
      job.call(undefined);
    });

    this._jobs = undefined;
    this._nextFlush = undefined;
  }

  cancel(id) {
    this._jobs.delete(id);
  }

}

export const manager = new MicroTaskManager();

export function setMicroTask(job) {
  return manager.schedule(job);
}

export function clearMicroTask(id) {
  manager.cancel(id);
}
