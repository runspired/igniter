import { manager } from 'igniter-runtime';

function waitForManager(cb) {
  if (manager._jobs.length > 0) {
    Promise.resolve().then(() => {
      waitForManager(cb);
    });
  } else {
    cb();
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

  // the extra resolve here will kick us to the end of the queue again
  Promise.all([managerEmpty])
    .then(callback);
}
