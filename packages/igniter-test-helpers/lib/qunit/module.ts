/* global requestAnimationFrame, cancelAnimationFrame */
import { Igniter } from 'igniter-runtime';
import { _clearDeprecations } from 'igniter-debug';
import { double, restore } from '../double';

const module = QUnit.module;

export default function isolatedTestEnvironment(name, options = {}) {
  module(name, {
    beforeEach() {
      _clearDeprecations();
      this._beforeFrameQueue = [];
      this._doubled = [];
      this.double = function(context, methodName, replacement) {
        this._doubled.push(double(context, methodName, replacement));
      };

      this._beforeFrameTimeout = requestAnimationFrame((frameStartTime) => {
        this._beforeFrameQueue.forEach((job) => {
          job(frameStartTime);
        });
      });
      this._afterFrameTimeouts = [];
      this.igniter = new Igniter();

      this.beforeFrameTasks = function beforeFrameTasks(job) {
        this._beforeFrameQueue.push(job);
      };

      /*
       This requires a test environment with true requestAnimationFrame
       to work at the moment.

       This is currently a "dumb" approach to waiting for frame tasks to complete,
       as we're just assuming that we want to see state at some point after, not
       immediately after.  Once we've made Igniter hookabe, this should tap into
       the engine.
       */
      this.afterCurrentFrameTasks = function afterFrametasks(job) {
        let frame = requestAnimationFrame(job);
        this._afterFrameTimeouts.push(frame);

        return frame;
      };

      if (options.beforeEach) {
        return options.beforeEach.call(this, ...arguments);
      }
    },

    afterEach() {
      let afterEach = options.afterEach && options.afterEach.call(this, ...arguments);
      return Promise.resolve(afterEach).then(() => {
        cancelAnimationFrame(this._beforeFrameTimeout);
        this._beforeFrameTimeout = null;
        this._beforeFrameQueue = null;
        this.igniter.destroy();
        this.igniter = null;

        this._afterFrameTimeouts.forEach((job) => {
          cancelAnimationFrame(job);
        });
        this._afterFrameTimeouts = null;

        this._doubled.forEach((doubled) => {
          restore(doubled);
        });
        this._doubled = null;
      });
    }
  });
}
