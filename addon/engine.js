import RSVP from 'rsvp';
import Frame from './frame';
import HashMap from 'perf-primitives/hash-map';
import { Task, Promise } from './-private/task';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
  setTimeout,
  clearTimeout
} from './-globals';
import {
  setMicroTask,
  clearMicroTask
} from './microtask-manager';

const FRAMES = ['event', 'render', 'measure', 'idle'];

const now = performance.now;

class FrameData {
  constructor() {
    this.jobs = 0;
    this.start = undefined;
    this.end = undefined;
  }
}

export default class Engine {
  constructor(queues) {
    this.items = new WeakMap();
    this.queueMap = _resolveQueues(queues);
    this.__queues = queues;
    this.meta = {
      lastFrame: undefined,
      frameData: new FrameData()
    };
    this.idleJobs = 0;
    this.nextMicroFlush = undefined;

    this.frames = {
      event: new Frame('event', queues.event),
      render: new Frame('render', queues.render),
      measure: new Frame('measure', queues.measure),
      idle: new Frame('idle', queues.idle)
    };

    this.tick();
  }

  flushSync() {

  }

  addQueue(opts) {
    if (opts.frame && opts.frame !== 'event') {
      throw new Error(`Attempted to create the queue '${opts.name}' in the frame '${opts.frame}' but only the EventFrame has configurable queues!`);
    }

    this.frames.event.addQueue(opts.name, opts.after);
  }

  tick() {
    this.scheduleFrameTask(
      () => {
        this.meta.frameData.start = now();

        this.frames.render.flush();
        this.frames.measure.flush();

        this.meta.lastFrame = this.meta.frameData;
        this.meta.frameData = new FrameData();
        this.meta.lastFrame.end = now();

        this.tick();
      }
    );
  }

  add(name, ...args) {
    if (this.__queues.event.indexOf(name) !== -1) {
      this.scheduleMicroFlush();
    }

    let frame = this.queueMap[name];
    let task = new Task(args);

    if (frame !== 'idle') {
      this.meta.jobs++;
    } else {
      this.idleJobs++;
    }

    this.frames[frame].push(name, task);
    this.items.set(task, task);

    return task;
  }

  addOnce(name, target, method, args) {
    let key = target || method;
    let task = this.frames[name].nonces.get(key);

    if (task) {
      // stitch old task resolution to new task value?
      task.args[2] = args;
    }

    task = this.add(name, target, method, args);
    this.frames[name].nonces.set(key, task);

    return task;
  }

  scheduleMicroFlush() {
    if (!this.nextMicroFlush) {
      this.nextMicroFlush = this.scheduleMicroTask(() => {
        this.frames.event.flush();
        this.nextMicroFlush = undefined;
      });
    }

    return this.nextMicroFlush;
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

  scheduleMicroTask(cb) {
    return setMicroTask(cb);
  }

  cancelMicroTask(id) {
    return clearMicroTask(id);
  }
}

function _resolveQueues(queues) {
  let hash = {};

  for (let i = 0; i < FRAMES.length; i++) {
    let name = FRAMES[i];
    let frame = queues[name];

    for (let j = 0; j < frame.length; j++) {
      hash[frame[j]] = name;
    }
  }

  return hash;
}
