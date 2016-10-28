function tempNotImplemented() {
  throw new Error('Method Not Implemented [yet ;)]');
}

export default class Buffer {
  constructor(chunk, options) {
    this.parentEngine = parent;
    this.paused = false;
    this._chunk = chunk;
    this.options = options;
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

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this._tick();
  }

  schedule() {
    tempNotImplemented();
  }

  scheduleOnce() {
    tempNotImplemented();
  }

  scheduleNext() {
    tempNotImplemented();
  }

  /*
    The parent engine will call into this exec method on it's own
    when it is about to render if the optional flag has been set.
   */
  _exec(deadline, isAboutToRender = false) {
    this._chunk.call(null, deadline, isAboutToRender);
  }

  _tick() {
    this.parentEngine.schedule('high', (deadline) => {
      if (!this.paused) {
        this._exec(deadline);
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
    tempNotImplemented();
  }
}
