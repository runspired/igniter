import Engine from './-private/engine';
import Backburner from './-private/backburner';

export default class Igniter {
  constructor() {
    this.engine = new Engine();
    this.backburner = new Backburner(this.engine);
  }

  flushSync() {
    this.engine.fastFinish();
  }

  schedule(name, job) {
    return this.engine.schedule(name, job);
  }

  scheduleOnce(name, job) {
    return this.engine.scheduleOnce(name, job);
  }

  cancel(job) {
    job.cancelled = true;
  }

  join(...args) {
    return this.schedule('actions', ...args);
  }

  next(job) {
    return this.engine.scheduleNext(job);
  }

  later(...args) {
    return this.backburner.later(...args);
  }

  debounce(...args) {
    return this.backburner.debounce(...args);
  }

  throttle(...args) {
    return this.backburner.throttle(...args);
  }

  addQueue(opts, after) {
    this.engine.addQueue(opts, after);
  }

  _addQueue(name, after) {
    return this.addQueue({ frame: 'event', name, after });
  }

  destroy() {
    this.backburner.destroy();
    this.engine.destroy();
    this.backburner = undefined;
    this.engine = undefined;
  }
}
