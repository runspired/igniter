import module from '../../helpers/module';
import { test } from 'qunit';
import { getQueue, getPhase, getQueueInPhase, getCurrentPhase } from '../../helpers/private-lookup';

let igniter;

module('Integration | @private | cleanup queue', {
  beforeEach() {
    igniter = this.igniter;
  },
  afterEach() {
    igniter = null;
  }
});

test(`We can schedule into the cleanup queue.`, function(assert) {
  let queue = getQueue(igniter, 'cleanup');

  assert.expect(2);
  assert.equal(queue.length, 0, 'The cleanup queue is initially empty');

  let job = igniter.schedule('cleanup', function() {
    assert.notOk(`Our 'cleanup' job was run despite being cancelled.`);
  });

  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`The Event Phase has it's own cleanup queue.`, function(assert) {
  let eventPhase  = getPhase(igniter, 'event');
  let cleanupQueue = getQueueInPhase(eventPhase, 'cleanup');

  assert.expect(2);
  assert.equal(cleanupQueue.length, 0, 'The cleanup queue is initially empty');

  let job = igniter.schedule('cleanup', function() {
    assert.notOk(`Our 'cleanup' job was run despite being cancelled.`);
  });

  assert.equal(cleanupQueue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`The Layout Phase has it's own cleanup queue.`, function(assert) {
  let advanceTest = assert.async(1);
  let layoutPhase  = getPhase(igniter, 'layout');
  let cleanupQueue = getQueueInPhase(layoutPhase, 'cleanup');

  assert.expect(3);
  assert.equal(cleanupQueue.length, 0, 'The cleanup queue is initially empty');

  igniter.schedule('render', function() {
    assert.equal(getCurrentPhase(igniter).name, 'layout', `We are scheduling cleanup within the Layout Phase`);

    let job = igniter.schedule('cleanup', function() {
      assert.notOk(`Our 'cleanup' job was run despite being cancelled.`);
    });

    assert.equal(cleanupQueue.length, 1, 'Our job was scheduled into the correct queue');

    igniter.cancel(job);
    advanceTest();
  });
});

test(`The Animation Phase has it's own cleanup queue.`, function(assert) {
  let advanceTest = assert.async(3);
  let animationPhase  = getPhase(igniter, 'animation');
  let cleanupQueue = getQueueInPhase(animationPhase, 'cleanup');

  assert.expect(2);
  assert.equal(cleanupQueue.length, 0, 'The cleanup queue is initially empty');

  igniter.schedule('measure', function() {
    assert.equal(getCurrentPhase(igniter).name, 'animation', `We are scheduling cleanup within the Animation Phase`);

    let job = igniter.schedule('cleanup', function() {
      assert.notOk(`Our 'cleanup' job was run despite being cancelled.`);
    });

    assert.equal(cleanupQueue.length, 1, 'Our job was scheduled into the correct queue');

    igniter.cancel(job);
    advanceTest();
  });
});
