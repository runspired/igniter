import { module, test } from 'qunit';
import { getQueue, getPhaseForQueue } from '../../helpers/private-lookup';
import afterIdletasks from '../../helpers/after-idletasks';
import Igniter from 'igniter';

let igniter;

module('Integration | @private | buffer', {
  integration: true,
  beforeEach() {
    igniter = new Igniter();
  },
  afterEach() {
    igniter.destroy();
    igniter = null;
  }
});

test(`buffer schedules into correct queue`, function(assert) {
  let queue = getQueue(igniter, 'high');

  assert.expect(2);
  assert.equal(queue.length, 0, 'The high queue is initially empty');

  const buffer = igniter.createBuffer(() => {
    buffer.stop();
  }, {});

  buffer.start();

  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');
});

test(`buffer does work while idling`, function(assert) {
  let advanceTest = assert.async(2);
  let idleHighQueue = getQueue(igniter, 'high');

  assert.expect(3);
  assert.equal(idleHighQueue.length, 0, 'The actions queue is initially empty');

  const buffer = igniter.createBuffer(() => {
    assert.ok('Our jobs flushed while idle');
    advanceTest();
    buffer.stop();
  }, {});

  buffer.start();

  afterIdletasks(function() {
    assert.equal(idleHighQueue.length, 0, 'Our job was flushed as an idletask');
    advanceTest();
  });
});

test(`buffer can be forced to finish before render`, function(assert) {
  let advanceTest = assert.async(2);
  let idleHighQueue = getQueue(igniter, 'high');
  let renderQueue = getQueue(igniter, 'render');

  assert.expect(6);
  assert.equal(renderQueue.length, 0, 'render queue is initially empty');

  let workDone = false;

  igniter.schedule('render', function() {
    assert.ok(workDone, 'work done by when render was called');

    advanceTest();
  });

  const buffer = igniter.createBuffer((deadline, isAboutToRender) => {
    if (!workDone) {
      assert.equal(deadline.timeRemaining(), 0, 'timeRemaining is correct value');
      assert.ok(deadline.didTimeout, 'didTimeout is correct value');
      assert.ok(isAboutToRender, 'isAboutToRender is set correctly');

      assert.equal(renderQueue.length, 1, 'buffer completed before render');

      workDone = true;

      buffer.stop();
      advanceTest();
    }
  }, { allowFinishBeforeRender: true });

  buffer.start();
});
