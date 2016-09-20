# Igniter

[![npm version](https://badge.fury.io/js/igniter.svg)](http://badge.fury.io/js/igniter)
[![Build Status](https://travis-ci.org/runspired/igniter.svg)](https://travis-ci.org/runspired/igniter)
[![Code Climate](https://codeclimate.com/github/runspired/igniter/badges/gpa.svg)](https://codeclimate.com/github/runspired/igniter)

Intelligent Work Distribution for JavaScript Applications.

## About

Igniter allows you to schedule work in ways that best align with
the browser's render cycle, minimizing forced layouts, reducing
instances of duplicated work, and giving us highly granular timing
and order of operation guarantees.

`Tasks` in Igniter are scheduled into a `Queue` within a `Frame` either
directly or via a `Timer`, a `Deadline`, or a `Buffer`.

## Frames

Types of work are divided into `Event`, `Layout`, `Measure` and `Idle`.
frames. These frames have unique timing guarantees and purposed queues.

The purposed queues are emptied in the order they are specified below.
Emptying is linear, it will not cycle back, but appending to an active
queue is valid.

All frames have a `cleanup` queue at the end, which will empty anything
that's been scheduled for cleanup at that point.

There is also a specialized `next` queue which flushes with an `as soon
as possible` policy and is similar in nature to `requestAnimationFrame`
in that you always schedule into the upcoming flush, unless you are
currently flushing the `next` queue, in which case you schedule into the
next `next` flush.

### EventFrame

- sync // do these things first
- actions // do these things second
- cleanup

### LayoutFrame

- render
- afterRender // deprecated, here for legacy backburner support
- destroy // deprecated, here for legacy backburner support
- cleanup

### MeasureFrame

- measure // read DOM properties here
- affect // edit DOM properties here
- cleanup

### IdleFrame

- idle // work that's just less important, but more aggresive idle than `ric`
- collect // work that will result in a major GC event (emptying a large array / releasing a large DOM tree)
- cleanup

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
