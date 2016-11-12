import Phase from './phase';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
  setTimeout,
  clearTimeout
} from '../-globals';
import {
  setMicroTask,
  clearMicroTask
} from '../microtask-manager';

import Token from 'cancellation-token';

import { assert, conditionalDeprecation } from 'igniter-debug';

export default class Engine {
  private phases: any;
  private _mapQueueToPhase: any;
  private currentPhase: Phase;

  private nextMicroTick: number;
  private nextFrameTick: number;

  private isRunning: boolean;
  private jobCount: number;

  constructor() {
    this.phases = {
      event: new Phase('event', ['sync', 'actions', 'cleanup']),
      layout: new Phase('layout', ['beforeRender', 'render', 'afterRender', 'cleanup']),
      animation: new Phase('animation', ['measure', 'affect', 'destroy', 'cleanup'])
    };

    this.currentPhase = null;

    this._mapQueueToPhase = {
      actions: this.phases.event,
      affect: this.phases.animation,
      afterRender: this.phases.layout, // backburner legacy, deprecated
      beforeRender: this.phases.layout,
      measure: this.phases.animation,
      destroy: this.phases.animation, // backburner legacy, deprecated
      render: this.phases.layout,
      sync: this.phases.event
    };
    this.nextMicroTick = undefined;
    this.nextFrameTick = undefined;
    this.isRunning = false;
    this.jobCount = 0;

    this.start();
  }

  start(): void {
    this.isRunning = true;
    this._tickFrame();
  }

  stop(): void {
    this.isRunning = false;
    this.cancelFrameTask(this.nextFrameTick);
    this.cancelMicroTask(this.nextMicroTick);
    this.nextFrameTick = null;
  }

  clear(): void {
    this.phases.event.clear();
    this.phases.layout.clear();
    this.phases.animation.clear();
    this.jobCount = 0;
  }

  fastFinish(): void {
    this.cancelMicroTask(this.nextMicroTick);
    while (this.jobCount) {
      this.jobCount -= this.phases.event.flush();
      this.jobCount -= this.phases.layout.flush();
      this.jobCount -= this.phases.animation.flush();
    }
  }

  schedule(name, job): Token {
    assert(`You must supply a name to igniter.schedule`, name && typeof name === 'string');
    assert(`You must supply a job to igniter.schedule`, job && typeof job === 'function');

    conditionalDeprecation(
      `The legacy backburner queue 'destroy' has been deprecated. Use 'cleanup' instead.`,
      {
        id: 'igniter.legacy-backburner.destroy',
        since: '0.0.0',
        until: '2.0.0'
      },
      name !== 'destroy');
    conditionalDeprecation(
      `The legacy backburner queue 'afterRender' has been deprecated. Use 'cleanup' instead.`,
      {
        id: 'igniter.legacy-backburner.afterRender',
        since: '0.0.0',
        until: '2.0.0'
      },
      name !== 'afterRender');

    this.jobCount++;
    let phase;
    if (name === 'cleanup') {
      phase = this.currentPhase || this.phases.event;
    } else {
      phase = this._mapQueueToPhase[name];
    }

    assert(`You scheduled a job into ${name} but this queue does not exist!`, phase);

    if (phase.name === 'event') {
      this._scheduleEventFlush();
    }

    return phase.push(name, job);
  }

  scheduleOnce(name, job): Token {
    // To be implemented
    return new Token();
  }

  scheduleNext(job): Token {
    // To be implemented
    return new Token();
  }

  _scheduleEventFlush(): void {
    if (!this.nextMicroTick) {
      this.nextMicroTick = this.scheduleMicroTask(() => {
        // In production, we will be executing all tasks immediately and a task
        // may schedule the next event flush which will set the next MicroTick.
        // In development this won't happen, because tasks are wrapped in promises.
        // Either way, we want to unset the nextMicroTick handler first.
        this.nextMicroTick = undefined;

        this.setCurrentPhase(this.phases.event);
        this.phases.event.flush();
        this.setCurrentPhase(null);
      });
    }
  }

  _tickFrame(): void {
    if (this.isRunning === false) {
      return;
    }
    this.nextFrameTick = this.scheduleFrameTask(
      () => {
        this.setCurrentPhase(this.phases.layout);
        this.phases.layout.flush();
        this.setCurrentPhase(this.phases.animation);
        this.phases.animation.flush();
        this.setCurrentPhase(null);

        this._tickFrame();
      }
    );
  }

  setCurrentPhase(phase): void {
    this.currentPhase = phase;
  }

  /*
   For backburner legacy reasons, we must support dynamically adding queues.
   This is not recommended use now that the event queue is flushed via microtask
   and can flush repeatedly prior to render.
   */
  addQueue({ frame = 'event', name }, after): void {
    this.phases[frame].addQueue(name, after);
    this._mapQueueToPhase[name] = this.phases[frame];
  }

  /*
   In order to ensure that we are able to accommodate
   environments in which requestAnimationFrame and microTask
   queues are unavailable, we sandbox our usage in a
   pluggable pattern.
   */
  scheduleFrameTask(cb): number {
    return requestAnimationFrame(cb);
  }

  cancelFrameTask(id): void {
    cancelAnimationFrame(id);
  }

  scheduleMacroTask(cb, time): number {
    return setTimeout(cb, time);
  }

  cancelMacroTask(id): void {
    clearTimeout(id);
  }

  scheduleMicroTask(cb): any {
    return setMicroTask(cb);
  }

  cancelMicroTask(id): any {
    return clearMicroTask(id);
  }

  destroy(): void {
    this.stop();
    this.clear();
    this.phases = null;
    this._mapQueueToPhase = null;
  }
}
