import Engine from './-private/engine';
import Backburner from './-private/backburner';
import Token from 'cancellation-token';

export default class Igniter {
  private engine: Engine;
  backburner: Backburner;

  constructor() {
    this.engine = new Engine();
    this.backburner = new Backburner(this.engine);
  }

  flushSync(): void {
    this.engine.fastFinish();
  }

  schedule(name, job): Token {
    return this.engine.schedule(name, job);
  }

  scheduleOnce(name, job): Token {
    return this.engine.scheduleOnce(name, job);
  }

  cancel(token: Token): void {
    token.cancel();
  }

  join(job): Token {
    return this.schedule('actions', job);
  }

  next(job): Token {
    return this.engine.scheduleNext(job);
  }

  later(...args): Token {
    return this.backburner.later(...args);
  }

  debounce(target, method, ...args): Token {
    return this.backburner.debounce(target, method, ...args);
  }

  throttle(target, method, ...args): Token {
    return this.backburner.throttle(target, method, ...args);
  }

  addQueue(opts, after): void {
    this.engine.addQueue(opts, after);
  }

  _addQueue(name, after): void {
    return this.addQueue({ frame: 'event', name }, after);
  }

  destroy(): void {
    this.backburner.destroy();
    this.engine.destroy();
    this.backburner = undefined;
    this.engine = undefined;
  }
}
