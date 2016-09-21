import { module, test } from 'qunit';
import { getQueue, getPhaseForQueue } from '../../helpers/private-lookup';
import afterMicrotasks from '../../helpers/after-microtasks';
import Igniter from 'igniter';

let igniter;

module('Integration | @private | timing', {
  integration: true,
  beforeEach() {
    igniter = new Igniter();
  },
  afterEach() {
    igniter.destroy();
    igniter = null;
  }
});

test(`Scheduled jobs fire in expected order`, function(assert) {
  let advanceTest = assert.async(3);

  let actionsQueue = getQueue(igniter, 'actions');
  let renderQueue = getQueue(igniter, 'render');
  let idleHighQueue = getQueue(igniter, 'high');

  assert.expect(12);

  assert.equal(actionsQueue.length, 0, 'The actions queue is initially empty');
  assert.equal(renderQueue.length, 0, 'The render queue is initially empty');
  assert.equal(idleHighQueue.length, 0, 'The idleHigh queue is initially empty');

  let buffer = igniter.createBuffer(function() {
    assert.ok('idle job was run');
    assert.equal(actionsQueue.length, 0, 'idle job ran after actions job');
    assert.equal(renderQueue.length, 0, 'idle job ran after render job');
    advanceTest();

    buffer.stop();
  }, {});

  buffer.start();

  igniter.schedule('render', function() {
    assert.ok('render job was run');
    assert.equal(actionsQueue.length, 0, 'render job ran after actions job');
    assert.equal(idleHighQueue.length, 1, 'render job ran before idle job');
    advanceTest();
  });

  igniter.schedule('actions', function() {
    assert.ok('actions job was run');
    assert.equal(renderQueue.length, 1, 'actions job ran before render job');
    assert.equal(idleHighQueue.length, 1, 'actions job ran before idle job');
    advanceTest();
  });

  // let queue = getQueue(igniter, 'sync');
  //
  // assert.expect(3);
  // assert.equal(queue.length, 0, 'The sync queue is initially empty');
  //
  // let job = igniter.schedule('sync', function() {
  //   assert.notOk(`Our 'sync' job was run despite being cancelled.`);
  // });
  //
  // assert.equal(getPhaseForQueue(igniter, 'sync').name, 'event', `The 'sync' queue is within the event phase`);
  // assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');
  //
  // igniter.cancel(job);
});
