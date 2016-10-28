import {
  module,
  test,
  getQueue,
  getPhaseForQueue
} from 'igniter-test-helpers';

import { console } from 'igniter-debug';

let igniter;

module('Integration | @private | animation phase', {
  beforeEach() {
    igniter = this.igniter;
  },
  afterEach() {
    igniter = null;
  }
});

test(`We can schedule into the Animation Phase via 'measure'`, function(assert) {
  let queue = getQueue(igniter, 'measure');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The measure queue is initially empty');

  let job = igniter.schedule('measure', function() {
    assert.notOk(`Our 'measure' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'measure').name, 'animation', `The 'render' queue is within the animation phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`We can schedule into the Animation Phase via 'affect'`, function(assert) {
  let queue = getQueue(igniter, 'affect');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The affect queue is initially empty');

  let job = igniter.schedule('affect', function() {
    assert.notOk(`Our 'affect' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'affect').name, 'animation', `The 'affect' queue is within the animation phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`[@deprecated @legacy] We can schedule into the Animation Phase via 'destroy'`, function(assert) {
  let queue = getQueue(igniter, 'destroy');

  assert.expect(3);
  assert.equal(queue.length, 0, 'The destroy queue is initially empty');

  let job = igniter.schedule('destroy', function() {
    assert.notOk(`Our 'destroy' job was run despite being cancelled.`);
  });

  assert.equal(getPhaseForQueue(igniter, 'destroy').name, 'animation', `The 'destroy' queue is within the animation phase`);
  assert.equal(queue.length, 1, 'Our job was scheduled into the correct queue');

  igniter.cancel(job);
});

test(`[@deprecated @legacy] Schedule into 'destroy' prints a deprecation notice.`, function(assert) {
  this.double(console, 'warn', function(message) {
    assert.ok(message.indexOf('DEPRECATION') === 0, `We print a deprecation`);
    assert.ok(message.indexOf('[deprecation id: igniter.legacy-backburner.destroy') !== -1, `The deprecation has the correct ID`);
  });

  assert.expect(2);

  let job = igniter.schedule('destroy', function() {
    assert.notOk(`Our 'destroy' job was run despite being cancelled.`);
  });

  igniter.cancel(job);
});

test(`The Animation Phase flushes as a frame task`, function(assert) {
  let advanceTest = assert.async(3);
  let queue = getQueue(igniter, 'measure');
  let frameStartTime;

  assert.expect(5);
  assert.equal(queue.length, 0, 'The measure queue is initially empty');

  this.beforeFrameTasks(function(time) {
    frameStartTime = time;
    assert.equal(queue.length, 1, 'The measure queue has not flushed at frame start');
    advanceTest();
  });

  igniter.schedule('measure', function() {
    assert.ok('Our job was run');
    advanceTest();
  });

  this.afterCurrentFrameTasks(function(frameTime) {
    assert.equal(frameTime, frameStartTime, 'Our jobs flushed within the same frame');
    assert.equal(queue.length, 0, 'Our job was flushed as a frame-task');
    advanceTest();
  });
});

test(`The affect queue is flushed after the measure queue`, function(assert) {
  let advanceTest = assert.async(2);
  let measureQueue = getQueue(igniter, 'measure');
  let affectQueue = getQueue(igniter, 'affect');
  let affectHasEmptied = false;
  let measureHasEmptied = false;

  assert.expect(8);

  assert.equal(measureQueue.length, 0, 'The render queue is initially empty');
  assert.equal(affectQueue.length, 0, 'The afterRender queue is initially empty');

  igniter.schedule('measure', function() {
    measureHasEmptied = true;
    assert.ok('Our render job was run');
    assert.equal(affectHasEmptied, false, 'The afterRender queue has not been flushed before the render queue');
    advanceTest();
  });
  igniter.schedule('affect', function() {
    affectHasEmptied = true;
    assert.ok('Our afterRender job was run');
    assert.equal(measureHasEmptied, true, 'The render queue has been emptied before the afterRender queue');
    advanceTest();
  });

  assert.equal(measureQueue.length, 1, 'The measure job was scheduled');
  assert.equal(affectQueue.length, 1, 'The affect job was scheduled');
});

test(`The Animation Frame flushes after the Layout Frame`, function(assert) {
  let advanceTest = assert.async(2);
  let measureQueue = getQueue(igniter, 'measure');
  let renderQueue = getQueue(igniter, 'render');
  let measureHasEmptied = false;
  let renderHasEmptied = false;

  assert.expect(8);

  assert.equal(measureQueue.length, 0, 'The measure queue is initially empty');
  assert.equal(renderQueue.length, 0, 'The render queue is initially empty');

  igniter.schedule('measure', function() {
    measureHasEmptied = true;
    assert.ok('Our measure job was run');
    assert.equal(renderHasEmptied, true, 'The render queue has been flushed before the measure queue');
    advanceTest();
  });
  igniter.schedule('render', function() {
    renderHasEmptied = true;
    assert.ok('Our render job was run');
    assert.equal(measureHasEmptied, false, 'The measure queue has not been flushed before the render queue');
    advanceTest();
  });

  assert.equal(measureQueue.length, 1, 'The measure job was scheduled');
  assert.equal(renderQueue.length, 1, 'The render job was scheduled');
});
