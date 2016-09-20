import Ember from 'ember';
import { manager } from 'igniter/microtask-manager';

const {
 run: { backburner }
} = Ember;

// RSVP schedules into backburner without batching
// once RSVP is divorced of backburner, we will need
// to hook RSVP's async function.
function waitForRSVP(cb) {
  if (backburner.currentInstance &&
    backburner.currentInstance.queues.actions._queue.length > 0) {
    Promise.resolve().then(() => {
      waitForRSVP(cb);
    });
  } else {
    cb();
  }
}

function waitForManager(cb) {
  if (manager._jobs.length > 0) {
    Promise.resolve().then(() => {
      waitForManager(cb);
    });
  } else {
    cb();
  }
}

function waitForDepth(cb, depth) {
  if (depth === 0) {
    cb();
  } else {
    Promise.resolve().then(() => {
      waitForDepth(cb, --depth);
    });
  }
}

/*
 This requires a test environment with true Promises to work
 at the moment, in order to assure that we are a microtask.

 At a minimum, Igniter requires us to wait out two microtask queue cycles
 because it wraps jobs as microtasks for dev and testing modes.

 Many microtasks schedule more microtasks, so we may need to
 recurse down a bit.
 */
export default function afterMicroTasks(callback, depth = 2) {
  /*
    Assuming this method was called after your other microtasks are scheduled,
    this will execute at the bottom of the stack.
   */
  // ensure that we've waited until the manager is empty
  let managerEmpty = new Promise((resolveManager) => {
    waitForManager(resolveManager);
  });

  // ensure that we've waited until rsvp is empty
  let rsvpEmpty = new Promise((resolveRSVP) => {
    waitForRSVP(resolveRSVP);
  });

  // ensure that we've waited the appropriate depth
  let depthEmpty = new Promise((resolveDepth) => {
    waitForDepth(resolveDepth, depth);
  });

  // the extra resolve here will kick us to the end of the queue again
  Promise.all([managerEmpty, rsvpEmpty, depthEmpty])
    .then(callback);
}
