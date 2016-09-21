export default class Buffer {
  constructor(parent, chunk, options) {
    this.parentEngine = parent;
    this.paused = false;
    this._chunk = chunk;
    this.options = options;

    this.nextIdleJob = undefined;
    this._queues = {
      sync: [],
      actions: [],
      beforeRender: [],
      render: [],
      measure: [],
      affect: [],
      cleanup: []
    };
  }

  stop() {
    if (this.nextIdleJob) {
      this.nextIdleJob.cancelled = true;
    }
    this.stopped = true;
  }

  start() {
    this.stopped = false;
    this._tick();
  }

  // schedule() {
  //
  // }
  //
  // scheduleOnce() {
  //
  // }
  //
  // scheduleNext() {
  //
  // }

  finishBeforeRender() {
    if (!this.stopped) {
      this._exec({
        timeRemaining() {
          return 0;
        },
        didTimeout: true
      }, true);
    }
  }

  /*
    The parent engine will call into this exec method on it's own
    when it is about to render if the optional flag has been set.
   */
  _exec(deadline, isAboutToRender = false) {
    this._chunk.call(null, deadline, isAboutToRender);
  }

  _tick() {
    this._nextIdleJob = this.parentEngine.schedule('high', (deadline) => {
      this._exec(deadline);

      if (!this.stopped) {
        this._tick();
      }
    });
  }

  /*
    buffers can be perpetually reused, so flush should deliver the items,
    ensuring any necessary micro/idle timers are set, and then reset it's
    internal state.
   */
  flush() {
    this.stopped = true;
    this.nextIdleJob.cancelled = true;
    this.nextIdleJob = undefined;
  }
}
