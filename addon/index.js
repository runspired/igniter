import Engine from './engine';
import Backburner from './-private/backburner';

export default class Igniter {
  constructor(options) {
    let queues = {
      event: ['sync', 'actions', 'cleanup'],
      render: ['render'],
      measure: ['afterRender', 'measure', 'affect'],
      idle: ['gc', 'query', 'destroy']
    };

    this.engine = new Engine(queues, options);
    this.backburner = new Backburner(this.engine);
  }

  flushSync() {
    this.engine.flushSync();
  }

  schedule(...args) {
    return this.engine.add(...args);
  }

  scheduleOnce(...args) {
    return this.engine.addOnce(...args);
  }

  join(...args) {
    return this.schedule('actions', ...args);
  }

  next(...args) {
    return this.schedule('next', ...args);
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
    console.warn('deprecated!');
    return this.addQueue({ frame: 'event', name, after });
  }
}
