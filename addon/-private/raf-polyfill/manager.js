import AnimationFrame from './frame';
import clock from '../timers/clock';

const now = performance.now;
const SCREEN_REFRESH_RATE = 1000 / 60;
const INITIAL_FRAME_DELAY = 32;

class FrameManager {
  constructor() {
    this.current = new AnimationFrame();
    this.next = new AnimationFrame();
    this.boundFlush = this._flush.bind(this);
    this.macroTaskFlush = clock.schedule(this.boundFlush, INITIAL_FRAME_DELAY);
  }

  schedule(job) {
    return this.next.schedule(job);
  }

  forget(id) {
    // you can cancel a requestAnimationCallback from outside raf callbacks
    this.next.forget(id);

    // you can cancel a requestAnimationCallback from another raf callback
    this.current.forget(id);
  }

  flush() {
    clock.forget(this.macroTaskFlush);
    this._flush();
  }

  _flush() {
    // we maintain two stable Frames and interchange them
    this.current = this.next;
    this.next = this.current;

    let flushBegin = this.current.flush();
    let flushEnd = now();
    let wait = Math.floor(SCREEN_REFRESH_RATE - flushEnd - flushBegin);

    this.macroTaskFlush = clock.schedule(this.boundFlush, wait);
  }
}

const manager = new FrameManager();

export default manager;
