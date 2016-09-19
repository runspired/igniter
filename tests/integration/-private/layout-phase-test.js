import { module, test } from 'qunit';
import { getQueue, getPhaseForQueue } from '../../helpers/private-lookup';
import afterFrametasks from '../../helpers/after-frametasks';
import Igniter from 'igniter';

let igniter;
let beforeFrameQueue;
let beforeFrameTimeout;

function beforeFrametasks(job) {
  beforeFrameQueue.push(job);
}

module('Integration | @private | layout phase', {
  integration: true,
  hooks: {
    beforeEach() {
      beforeFrameQueue = [];
      beforeFrameTimeout = requestAnimationFrame((frameStartTime) => {
        beforeFrameQueue.forEach((job) => {
          job(frameStartTime);
        });
      });
      igniter = new Igniter();
    },
    afterEach() {
      cancelAnimationFrame(beforeFrameTimeout);
      beforeFrameTimeout = null;
      beforeFrameQueue = null;
      igniter.destroy();
      igniter = null;
    }
  }
});

test(`We can schedule into the Layout Phase via 'render'`, function(assert) {
  let queue = getQueue(igniter, 'render');

  assert.expect(2);
  assert.equal(queue.length, 0, 'The render queue is initially empty');

  let job = igniter.schedule('render', function() {
    assert.notOk(`Our 'render' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'render').name, 'layout', `The 'render' queue is within the layout phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`We can schedule into the Layout Phase via 'afterRender'`, function(assert) {
  let queue = getQueue(igniter, 'afterRender');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The afterRender queue is initially empty');

  let job = igniter.schedule('afterRender', function() {
    assert.notOk(`Our 'afterRender' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'afterRender').name, 'layout', `The 'afterRender' queue is within the layout phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});


test(`The Layout Phase flushes as a frame task`, function(assert) {
  let advanceTest = assert.async(2);
  let queue = getQueue(igniter, 'render');
  let frameStartTime;

  assert.expect(5);
  assert.equal(queue.length, 0, 'The render queue is initially empty');

  beforeFrametasks(function(time) {
    frameStartTime = time;
    assert.equal(queue.length, 1, 'The render queue has not flushed at frame start');
    advanceTest();
  });

  igniter.schedule('render', function() {
    assert.ok('Our job was run');
    advanceTest();
  });

  afterFrametasks(function(frameTime) {
    assert.equal(frameTime, frameStartTime, 'Our jobs flushed within the same frame');
    assert.equal(queue.length, 0, 'Our job was flushed as a frame-task');
    advanceTest();
  });
});

test(`The afterRender queue is flushed after the render queue`, function(assert) {
  let advanceTest = assert.async(2);
  let renderQueue = getQueue(igniter, 'render');
  let afterRenderQueue = getQueue(igniter, 'afterRender');

  assert.expect(8);

  assert.equal(renderQueue.length, 0, 'The render queue is initially empty');
  assert.equal(afterRenderQueue.length, 0, 'The afterRender queue is initially empty');

  igniter.schedule('render', function() {
    assert.ok('Our render job was run');
    assert.equal(afterRenderQueue.length, 1, 'The afterRender queue has not been flushed before the render queue');
    advanceTest();
  });
  igniter.schedule('afterRender', function() {
    assert.ok('Our afterRender job was run');
    assert.equal(renderQueue.length, 0, 'The render queue has been emptied before the afterRender queue');
    advanceTest();
  });

  assert.equal(renderQueue.length, 1, 'The render job was scheduled');
  assert.equal(afterRenderQueue.length, 1, 'The afterRender job was scheduled');
});

test(`The Layout Frame flushes after the Event Frame`, function(assert) {
  let advanceTest = assert.async(2);
  let actionsQueue = getQueue(igniter, 'actions');
  let renderQueue = getQueue(igniter, 'render');

  assert.expect(8);

  assert.equal(actionsQueue.length, 0, 'The actions queue is initially empty');
  assert.equal(renderQueue.length, 0, 'The render queue is initially empty');

  igniter.schedule('actions', function() {
    assert.ok('Our actions job was run');
    assert.equal(renderQueue.length, 1, 'The render queue has not been flushed before the actions queue');
    advanceTest();
  });
  igniter.schedule('render', function() {
    assert.ok('Our render job was run');
    assert.equal(actionsQueue.length, 0, 'The actions queue has been emptied before the render queue');
    advanceTest();
  });

  assert.equal(actionsQueue.length, 1, 'The actions job was scheduled');
  assert.equal(renderQueue.length, 1, 'The render job was scheduled');
});
