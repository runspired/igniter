import { module, test } from 'qunit';
import { getQueue, getPhaseForQueue } from '../../helpers/private-lookup';
import afterMicrotasks from '../../helpers/after-microtask';
import Igniter from 'igniter';

let igniter;

module('Integration | @private | event phase', {
  integration: true,
  hooks: {
    beforeEach() {
      igniter = new Igniter();
    },
    afterEach() {
      igniter.destroy();
      igniter = null;
    }
  }
});

test(`We can schedule into the Event Phase via 'sync'`, function(assert) {
  let queue = getQueue(igniter, 'sync');

  assert.expect(2);
  assert.equal(queue.length, 0, 'The sync queue is initially empty');

  let job = igniter.schedule('sync', function() {
    assert.notOk(`Our 'sync' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'sync').name, 'event', `The 'sync' queue is within the event phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`We can schedule into the Event Phase via 'actions'`, function(assert) {
  let queue = getQueue(igniter, 'actions');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The actions queue is initially empty');

  let job = igniter.schedule('actions', function() {
    assert.notOk(`Our 'actions' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'actions').name, 'event', `The 'actions' queue is within the event phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});


test(`The Event Phase flushes as a microtask`, function(assert) {
  let advanceTest = assert.async(2);
  let queue = getQueue(igniter, 'actions');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The actions queue is initially empty');

  igniter.schedule('actions', function() {
    assert.ok('Our job was run');
    advanceTest();
  });

  afterMicrotasks(function() {
    assert.equal(queue.length, 0, 'Our job was flushed as a microtask');
    advanceTest();
  });
});

test(`The Actions queue is flushed after the Sync queue`, function(assert) {
  let advanceTest = assert.async(2);
  let syncQueue = getQueue(igniter, 'sync');
  let actionsQueue = getQueue(igniter, 'actions');

  assert.expect(8);

  assert.equal(syncQueue.length, 0, 'The sync queue is initially empty');
  assert.equal(actionsQueue.length, 0, 'The actions queue is initially empty');

  igniter.schedule('sync', function() {
    assert.ok('Our sync job was run');
    assert.equal(actionsQueue.length, 1, 'The actions queue has not been flushed before the sync queue');
    advanceTest();
  });
  igniter.schedule('actions', function() {
    assert.ok('Our actions job was run');
    assert.equal(syncQueue.length, 0, 'The sync queue has been emptied before the actions queue');
    advanceTest();
  });

  assert.equal(syncQueue.length, 1, 'The sync job was scheduled');
  assert.equal(actionsQueue.length, 1, 'The actions job was scheduled');
});
