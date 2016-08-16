/* global Ember, require */
(function() {
  requestAnimationFrame(function() {
    var backburner = Ember.run.backburner;

    var Igniter = require('igniter').default;
    var GUID_KEY = Ember.__loader.require('ember-metal/utils').GUID_KEY;

    var property_events = Ember.__loader.require('ember-metal/property_events');
    var beginPropertyChanges = property_events.beginPropertyChanges;
    var endPropertyChanges = property_events.endPropertyChanges;
    var assert = Ember.assert;

    var igniter = new Igniter({
      GUID_KEY: GUID_KEY,
      sync: {
        before: beginPropertyChanges,
        after: endPropertyChanges
      },
      defaultQueue: 'actions',
      onBegin: onBegin,
      onEnd: onEnd,
      onErrorTarget: Ember,
      onErrorMethod: 'onerror'
    });

    function run() {
      return igniter.run(...arguments);
    }

    function onBegin(current) {
      run.currentRunLoop = current;
    }

    function onEnd(current, next) {
      run.currentRunLoop = next;
    }

    run.join = function() {
      return igniter.join(...arguments);
    };

    run.bind = function(...curried) {
      return function(...args) {
        return run.join(...curried.concat(args));
      };
    };

    run.backburner = igniter;
    run.currentRunLoop = null;
    run.queues = igniter.queueNames;

    run.begin = function() {
      igniter.begin();
    };

    run.end = function() {
      igniter.end();
    };


    run.schedule = function(/* queue, target, method */) {
      checkAutoRun();
      igniter.schedule(...arguments);
    };

    // Used by global test teardown
    run.hasScheduledTimers = function() {
      return igniter.hasTimers();
    };

    // Used by global test teardown
    run.cancelTimers = function() {
      igniter.cancelTimers();
    };

    run.sync = function() {
      igniter.flushSync();
    };

    run.later = function(/*target, method*/) {
      return igniter.later(...arguments);
    };

    run.once = function(...args) {
      checkAutoRun();
      args.unshift('actions');
      return igniter.scheduleOnce(...args);
    };

    run.scheduleOnce = function(/*queue, target, method*/) {
      checkAutoRun();
      return igniter.scheduleOnce(...arguments);
    };

    run.next = function(...args) {
      args.push(1);
      return igniter.later(...args);
    };

    run.cancel = function(timer) {
      return igniter.cancel(timer);
    };

    run.debounce = function() {
      return igniter.debounce(...arguments);
    };

    run.throttle = function() {
      return igniter.throttle(...arguments);
    };

    // Make sure it's not an autorun during testing
    function checkAutoRun() {
      if (!run.currentRunLoop) {
        assert(
          `You have turned on testing mode, which disabled the run-loop's autorun. ` +
          `You will need to wrap any code with asynchronous side-effects in a run`,
          !Ember.testing
        );
      }
    }

    run._addQueue = function(name, after) {
      igniter._addQueue(name, after);
    };

    // clean house
    backburner.end();
    backburner._platform = {
      setTimeout: function() {
        throw new Error('Whoops!');
      }
    };


    Ember.Backburner = Igniter;
    Ember.run = run;
  });
})();
