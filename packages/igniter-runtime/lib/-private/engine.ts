import Phase from './phase';
import Buffer from './buffer';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
  requestIdleCallback,
  cancelIdleCallback,
  setTimeout,
  clearTimeout
} from '../-globals';
import {
  setMicroTask,
  clearMicroTask
} from '../microtask-manager';
import { assert } from './developer-ergonomics';

export default class Engine {
  constructor() {
    let phases = this.phases = {
      event: new Phase('event', ['sync', 'actions']),
      layout: new Phase('layout', ['beforeRender', 'render', 'afterRender']),
      measure: new Phase('measure', ['measure', 'affect', 'destroy']),
      idle: new Phase('idle', ['high', 'low'])
    };
    this._mapQueueToPhase = {
      actions: phases.event,
      affect: phases.measure,
      afterRender: phases.layout, // backburner legacy, deprecated
      beforeRender: phases.layout,
      measure: phases.measure,
      destroy: phases.measure, // backburner legacy, deprecated
      render: phases.layout,
      sync: phases.event,
      high: phases.idle,
      low: phases.idle
    };
    this.nextMicroTick = undefined;
    this.nextFrameTick = undefined;
    this.nextIdleTick = undefined;
    this.isRunning = false;
    this.jobCount = 0;

    this._buffers = [];

    this.start();
  }

  createBuffer(fn, opts) {
    let buffer = new Buffer(fn, opts);
    this._buffers.push(buffer);

    /*
      This should setup a hook for the parent to call into the buffer before render
      if required. This hook should happen pre beforeRender.
     */

    return buffer;
  }

  destroyBuffer(buffer) {
    /*
      unhook and forget the buffer here.
      this should be called by buffer.destroy();
     */
  }

  start() {
    this.isRunning = true;
    this._tickFrame();
  }

  stop() {
    this.isRunning = false;
    this.cancelFrameTask(this.nextFrameTick);
    this.cancelMicroTask(this.nextMicroTick);
    this.cancelIdleTask(this.nextIdleTick);
    this.nextFrameTick = null;
  }

  clear() {
    this.phases.event.clear();
    this.phases.layout.clear();
    this.phases.measure.clear();
    this.phases.idle.clear();
    this.jobCount = 0;
  }

  fastFinish() {
    this.cancelMicroTask(this.nextMicroTick);
    this.cancelIdleTask(this.nextIdleTick);
    while (this.jobCount) {
      this.jobCount -= this.phases.event.flush();
      this.jobCount -= this.phases.layout.flush();
      this.jobCount -= this.phases.measure.flush();
      this.jobCount -= this.phases.idle.flush();
    }
  }

  schedule(name, job) {
    assert(`You must supply a name to igniter.schedule`, name && typeof name === 'string');
    assert(`You must supply a job to igniter.schedule`, job && typeof job === 'function');

    this.jobCount++;
    let phase = this._mapQueueToPhase[name];

    assert(`You scheduled a job into ${name} but this queue does not exist!`, phase);

    if (phase.name === 'event') {
      this._scheduleEventFlush();
    }

    return phase.push(name, job);
  }

  scheduleOnce(name, target, method, args) {
    let key = target || method;
    let task = this.phases[name].nonces.get(key);

    if (task) {
      // stitch old task resolution to new task value?
      task.args[2] = args;
    }

    task = this.schedule(name, target, method, args);
    this.phases[name].nonces.set(key, task);

    return task;
  }

  scheduleNext() {
    throw new Error('Next has not been implemented');
  }

  _scheduleEventFlush() {
    if (!this.nextMicroTick) {
      this.nextMicroTick = this.scheduleMicroTask(() => {
        this.phases.event.flush();
        this.nextMicroTick = undefined;
      });
    }
  }

  _tickFrame() {
    if (this.isRunning === false) {
      return;
    }
    this.nextFrameTick = this.scheduleFrameTask(
      () => {
        this.phases.layout.flush();
        this.phases.measure.flush();
        this._tickFrame();
      }
    );
  }

  /*
   For backburner legacy reasons, we must support dynamically adding queues.
   This is not recommended use now that the event queue is flushed via microtask
   and can flush repeatedly prior to render.
   */
  addQueue({ frame = 'event', name, after }) {
    this.phases[frame].addQueue(name, after);
    this._mapQueueToPhase[name] = this.phases[frame];
  }

  /*
   In order to ensure that we are able to accommodate
   environments in which requestAnimationFrame and microTask
   queues are unavailable, we sandbox our usage in a
   pluggable pattern.
   */
  scheduleFrameTask(cb) {
    return requestAnimationFrame(cb);
  }

  cancelFrameTask(id) {
    cancelAnimationFrame(id);
  }

  scheduleMacroTask(cb, time) {
    return setTimeout(cb, time);
  }

  cancelMacroTask(id) {
    clearTimeout(id);
  }

  scheduleIdleTask(cb, opts) {
    return requestIdleCallback(cb, opts);
  }

  cancelIdleTask(id) {
    cancelIdleCallback(id);
  }

  scheduleMicroTask(cb) {
    return setMicroTask(cb);
  }

  cancelMicroTask(id) {
    return clearMicroTask(id);
  }

  destroy() {
    this.stop();
    this.clear();
    this.phases = null;
    this._mapQueueToPhase = null;
  }
}
