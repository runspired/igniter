import {
  module,
  test,
  getQueue,
  getPhaseForQueue
} from 'igniter-test-helpers';

let igniter;

module('Integration | @private | idle phase', {
  beforeEach() {
    igniter = this.igniter;
  },
  afterEach() {
    igniter = null;
  }
});

test(`We can schedule into the Idle Phase via 'idleHigh'`, function(assert) {
  let queue = getQueue(igniter, 'idleHigh');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The idleHigh queue is initially empty');

  let job = igniter.schedule('idleHigh', function() {
    assert.notOk(`Our 'idleHigh' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'idleHigh').name, 'idle', `The 'idleHigh' queue is within the Idle Phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`We can schedule into the Idle Phase via 'idleLow'`, function(assert) {
  let queue = getQueue(igniter, 'idleLow');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The idleLow queue is initially empty');

  let job = igniter.schedule('idleLow', function() {
    assert.notOk(`Our 'idleLow' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'idleLow').name, 'idle', `The 'idleLow' queue is within the Idle Phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`The idleLow queue is flushed after the idleHigh queue`, function(assert) {
  let advanceTest = assert.async(2);
  let idleHighQueue = getQueue(igniter, 'idleHigh');
  let idleLowQueue = getQueue(igniter, 'idleLow');
  let idleLowHasEmptied = false;
  let idleHighHasEmptied = false;

  assert.expect(8);

  assert.equal(idleHighQueue.length, 0, 'The idleHigh queue is initially empty');
  assert.equal(idleLowQueue.length, 0, 'The idleLow queue is initially empty');

  igniter.schedule('idleHigh', function() {
    idleHighHasEmptied = true;
    assert.ok('Our idleHigh job was run');
    assert.equal(idleLowHasEmptied, false, 'The idleLow queue has not been flushed before the idleHigh queue');
    advanceTest();
  });
  igniter.schedule('idleLow', function() {
    idleLowHasEmptied = true;
    assert.ok('Our idleLow job was run');
    assert.equal(idleHighHasEmptied, true, 'The idleHigh queue has been emptied before the idleLow queue');
    advanceTest();
  });

  assert.equal(idleHighQueue.length, 1, 'The idleHigh job was scheduled');
  assert.equal(idleLowQueue.length, 1, 'The idleLow job was scheduled');
});
