import module from '../../helpers/module';
import { test } from 'qunit';
import { getQueue, getPhaseForQueue } from '../../helpers/private-lookup';

let igniter;

module('Integration | @private | layout phase', {
  beforeEach() {
    igniter = this.igniter;
  },
  afterEach() {
    igniter = null;
  }
});

test(`We can schedule into the Layout Phase via 'beforeRender'`, function(assert) {
  let queue = getQueue(igniter, 'beforeRender');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The beforeRender queue is initially empty');

  let job = igniter.schedule('beforeRender', function() {
    assert.notOk(`Our 'beforeRender' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'beforeRender').name, 'layout', `The 'beforeRender' queue is within the Layout Phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`We can schedule into the Layout Phase via 'render'`, function(assert) {
  let queue = getQueue(igniter, 'render');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The render queue is initially empty');

  let job = igniter.schedule('render', function() {
    assert.notOk(`Our 'render' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'render').name, 'layout', `The 'render' queue is within the Layout Phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`[@deprecated @legacy] We can schedule into the Layout Phase via 'afterRender'`, function(assert) {
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

test(`[@deprecated @legacy] Schedule into 'afterRender' prints a deprecation notice.`, function(assert) {
  this.double(console, 'warn', function(message) {
    assert.ok(message.indexOf('DEPRECATION') === 0, `We print a deprecation`);
    assert.ok(message.indexOf('[deprecation id: igniter.legacy-backburner.afterRender') !== -1, `The deprecation has the correct ID`);
  });

  assert.expect(2);

  let job = igniter.schedule('afterRender', function() {
    assert.notOk(`Our 'afterRender' job was run despite being cancelled.`);
  });

  igniter.cancel(job);
});

test(`The Layout Phase flushes as a frame task`, function(assert) {
  let advanceTest = assert.async(3);
  let queue = getQueue(igniter, 'render');
  let frameStartTime;

  assert.expect(5);
  assert.equal(queue.length, 0, 'The render queue is initially empty');

  this.beforeFrameTasks(function(time) {
    frameStartTime = time;
    assert.equal(queue.length, 1, 'The render queue has not flushed at frame start');
    advanceTest();
  });

  igniter.schedule('render', function() {
    assert.ok('Our job was run');
    advanceTest();
  });

  this.afterCurrentFrameTasks(function(frameTime) {
    assert.equal(frameTime, frameStartTime, 'Our jobs flushed within the same frame');
    assert.equal(queue.length, 0, 'Our job was flushed as a frame-task');
    advanceTest();
  });
});

test(`The render queue is flushed after the beforeRender queue`, function(assert) {
  let advanceTest = assert.async(2);
  let beforeRenderQueue = getQueue(igniter, 'beforeRender');
  let renderQueue = getQueue(igniter, 'render');
  let renderHasEmptied = false;
  let beforeRenderHasEmptied = false;

  assert.expect(8);

  assert.equal(beforeRenderQueue.length, 0, 'The beforeRender queue is initially empty');
  assert.equal(renderQueue.length, 0, 'The render queue is initially empty');

  igniter.schedule('beforeRender', function() {
    beforeRenderHasEmptied = true;
    assert.ok('Our beforeRender job was run');
    assert.equal(renderHasEmptied, false, 'The render queue has not been flushed before the beforeRender queue');
    advanceTest();
  });
  igniter.schedule('render', function() {
    renderHasEmptied = true;
    assert.ok('Our afterRender job was run');
    assert.equal(beforeRenderHasEmptied, true, 'The beforeRender queue has been emptied before the render queue');
    advanceTest();
  });

  assert.equal(beforeRenderQueue.length, 1, 'The beforeRender job was scheduled');
  assert.equal(renderQueue.length, 1, 'The render job was scheduled');
});

test(`[@deprecated @legacy] The afterRender queue is flushed after the render queue`, function(assert) {
  let advanceTest = assert.async(2);
  let renderQueue = getQueue(igniter, 'render');
  let afterRenderQueue = getQueue(igniter, 'afterRender');
  let afterRenderHasEmptied = false;
  let renderHasEmptied = false;

  assert.expect(8);

  assert.equal(renderQueue.length, 0, 'The render queue is initially empty');
  assert.equal(afterRenderQueue.length, 0, 'The afterRender queue is initially empty');

  igniter.schedule('render', function() {
    renderHasEmptied = true;
    assert.ok('Our render job was run');
    assert.equal(afterRenderHasEmptied, false, 'The afterRender queue has not been flushed before the render queue');
    advanceTest();
  });
  igniter.schedule('afterRender', function() {
    afterRenderHasEmptied = true;
    assert.ok('Our afterRender job was run');
    assert.equal(renderHasEmptied, true, 'The render queue has been emptied before the afterRender queue');
    advanceTest();
  });

  assert.equal(renderQueue.length, 1, 'The render job was scheduled');
  assert.equal(afterRenderQueue.length, 1, 'The afterRender job was scheduled');
});

test(`The Layout Frame flushes after the Event Frame`, function(assert) {
  let advanceTest = assert.async(2);
  let actionsQueue = getQueue(igniter, 'actions');
  let renderQueue = getQueue(igniter, 'render');
  let actionsHasEmptied = false;
  let renderHasEmptied = false;

  assert.expect(8);

  assert.equal(actionsQueue.length, 0, 'The actions queue is initially empty');
  assert.equal(renderQueue.length, 0, 'The render queue is initially empty');

  igniter.schedule('actions', function() {
    actionsHasEmptied = true;
    assert.ok('Our actions job was run');
    assert.equal(renderHasEmptied, false, 'The render queue has not been flushed before the actions queue');
    advanceTest();
  });
  igniter.schedule('render', function() {
    renderHasEmptied = true;
    assert.ok('Our render job was run');
    assert.equal(actionsHasEmptied, true, 'The actions queue has been emptied before the render queue');
    advanceTest();
  });

  assert.equal(actionsQueue.length, 1, 'The actions job was scheduled');
  assert.equal(renderQueue.length, 1, 'The render job was scheduled');
});
