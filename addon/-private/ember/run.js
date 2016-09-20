import Ember from 'ember';
import Igniter from 'igniter';
import { GUID_KEY } from './metal-utils';
import { beginPropertyChanges, endPropertyChanges } from './metal-property_events';

const {
  assert,
  testing: ENV_IS_TESTING
} = Ember;

/*
  Currently Backburner will pass in options we don't actually want
  as the first param, so we proxy through better queue names here.

  `cleanup` is special cased, hard coded into each frame.
 */
class BackburnerIgniter extends Igniter {
  constructor(opts) {
    super({
      event: ['sync', 'actions'],
      render: ['render', 'afterRender'],
      measure: ['measure', 'affect'],
      idle: ['gc', 'query', 'destroy']
    }, opts);
  }
}

let backburner = new BackburnerIgniter({
  GUID_KEY,
  sync: {
    before: beginPropertyChanges,
    after: endPropertyChanges
  },
  defaultQueue: 'actions',
  onBegin,
  onEnd,
  onErrorTarget: Ember,
  onErrorMethod: 'onerror'
});

function run() {
  return backburner.run(...arguments);
}

function onBegin(current) {
  run.currentRunLoop = current;
}

function onEnd(current, next) {
  run.currentRunLoop = next;
}

run.join = function() {
  return backburner.join(...arguments);
};

run.bind = function(...curried) {
  return function(...args) {
    return run.join(...curried.concat(args));
  };
};

run.backburner = backburner;
run.currentRunLoop = null;
run.queues = backburner.queueNames;

run.begin = function() {
  backburner.begin();
};

run.end = function() {
  backburner.end();
};

run.schedule = function(/* queue, target, method */) {
  checkAutoRun();
  backburner.schedule(...arguments);
};

// Used by global test teardown
run.hasScheduledTimers = function() {
  return backburner.hasTimers();
};

// Used by global test teardown
run.cancelTimers = function() {
  backburner.cancelTimers();
};

run.sync = function() {
  if (backburner.currentInstance) {
    backburner.currentInstance.queues.sync.flush();
  }
};

run.later = function(/*target, method*/) {
  return backburner.later(...arguments);
};

run.once = function(...args) {
  checkAutoRun();
  args.unshift('actions');
  return backburner.scheduleOnce(...args);
};

run.scheduleOnce = function(/*queue, target, method*/) {
  checkAutoRun();
  return backburner.scheduleOnce(...arguments);
};

run.next = function(...args) {
  args.push(1);
  return backburner.later(...args);
};

run.cancel = function(timer) {
  return backburner.cancel(timer);
};

run.debounce = function() {
  return backburner.debounce(...arguments);
};

run.throttle = function() {
  return backburner.throttle(...arguments);
};

// Make sure it's not an autorun during testing
function checkAutoRun() {
  if (!run.currentRunLoop) {
    assert(
      `You have turned on testing mode, which disabled the run-loop's autorun. ` +
      `You will need to wrap any code with asynchronous side-effects in a run`,
      !ENV_IS_TESTING
    );
  }
}

run._addQueue = function(name, after) {
  backburner._addQueue(name, after);
};

export default run;
