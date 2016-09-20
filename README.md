# Igniter

[![npm version](https://badge.fury.io/js/igniter-core.svg)](http://badge.fury.io/js/igniter-core)
[![Build Status](https://travis-ci.org/runspired/igniter.svg)](https://travis-ci.org/runspired/igniter)
[![Code Climate](https://codeclimate.com/github/runspired/igniter/badges/gpa.svg)](https://codeclimate.com/github/runspired/igniter)

Intelligent Work Distribution for JavaScript Applications.

## Installation

`npm install --save igniter-core`

## About

Igniter allows you to schedule work in ways that best align with
the browser's render cycle, minimizing forced layouts, reducing
instances of duplicated work, and giving us highly granular timing
and order of operation guarantees.

`Tasks` in Igniter are scheduled into a `Queue` within a `Phase` either
directly, via a `Timer`, or indirectly via a `Buffer`.

## Primary Use

```js
import Igniter from 'igniter-core';

const igniter = new Igniter();

// schedule some work into a queue
igniter.schedule(<queueName>, <fn>);

// schedule some work into a queue, enforce that it is only scheduled
// once.
igniter.scheduleOnce(<queueName>, <fn>);

// similar to setTimeout but with better timing guarantees
// it will also flush within the `actions` queue.
igniter.later(<fn>, <milliseconds>);

igniter.throttle(<fn> [, ...args], <milliseconds>);

igniter.debounce(<fn> [, ...args], <milliseconds>, <immediate>);

igniter.scheduleNext(<queueName>, <fn>);
```

## Use with Buffers

Buffers are ideal for deferring scheduling of work until some primary
task is complete.

```js
import Igniter from 'igniter-core';

const igniter = new Igniter();
const buffer = igniter.buffer(function(deadline, isAboutToRender) {
  /*
  .. do some of what you need ..
  .. this function will be run asap using `requestIdleCallback` .. 
  .. until buffer.pause() is called ..
  .. a paused buffer can be resumed via buffer.resume() ..
  */
}, { timeout: 16, allowFinishBeforeRender: true });

// schedule some work into a buffer
buffer.schedule(<queueName>, <fn>);

// schedule some work into a buffer, enforce that it is only scheduled
// once.
buffer.scheduleOnce(<queueName>, <fn>);

buffer.scheduleNext(<queueName>, <fn>);

// empty the buffer into the igniter instance
buffer.flush();
```

When using a buffer, it's ideal to yield control back to the main thread
as often as possible.

## Phases

Types of work are divided into `Event`, `Layout`, `Measure` and `Idle`.
phases. These phases have specialized timing guarantees and contain named
queues intended for specific types of work you should be doing in that phase.

Queues are emptied in the order they are specified below.

All phases except `idle` have a `cleanup` queue at the end, which will
empty anything that's been scheduled for cleanup at that point.


### Event Phase

The event phase flushes as a microtask and is ideal for scheduling work
that should be done asynchronously but immediately.

```
sync => actions => cleanup
```

### Layout Phase

The layout phase is where you should perform your major DOM alterations.
Rendering engines like Glimmer2 or React should schedule (or deliver)
their work during `render`.`

```
beforeRender => render => afterRender (deprecated) => cleanup
```

`afterRender` exists for legacy backburner.js support, such uses should 
now use `measure`.

The Layout and Animation phases both flush via `requestAnimationFrame`,
with Layout being flushed prior to Animation.

### Animation Phase

Minor DOM reads and writes should happen in the Animation phase. You should
batch DOM reads into `measure` and DOM writes into `affect`.

```
measure => affect => destroy (deprecated) => cleanup
```

`destroy` exists to preserve legacy backburner.js timing semantics, such
uses should now use either `cleanup` or schedule into one of the `idle`
phase queues.

### Idle Phase

Idle is ideal for work that will result in a major GC event (such as
emptying a large array / releasing a large DOM tree), or is expensive
 but has low priority.
 
 
```
high => low
```

Idle is the only phase without a `cleanup` queue.

Idle is similar in nature to using `requestIdleCallback`.  All work
present in the `high` queue will be completed before the `low` queue
unless the deadline for that work has passed.

Unlike other phases, Idle does not flush all of its jobs at once, but
instead yields back to Igniter if any other work is scheduled or if
too much time has passed.

## Buffers

Buffers allow you do create a "yielding" task that captures scheduled work
and delivers it to the appropriate Frame and Queue only once that task
is complete.  Buffers can accept deadlines, with a specialized option of
`finishBeforeRender: true` being available.

## Deadlines

## Render Metadata

## Polyfills

This library functionally polyfills `requestAnimationFrame` for IE9.
It polyfills `MicroTasks` for IE9 and IE10.
It polyfills `requestIdleCallback` for non-chrome browsers.

## Using with external libs that use `requestAnimationFrame`

When using igniter with a library in which you do not control the scheduling
of asynchronous tasks, it is best if you can supply that lib our customized
`raf`.

```js
import {
  requestAnimationFrame,
  cancelAnimationFrame
} from 'igniter/raf';

...

// override external lib raf usage
```
