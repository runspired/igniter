import Phase from 'igniter-runtime/lib/-private/phase';
import assert from './assert';

/**
 * @public
 * @param {Igniter} instance
 * @param {String} queueName
 * @returns {Phase} Igniter engine phase (Idle, Render, Measure, Event)
 */
export default function getQueueInPhase(phase, queueName) {
  assert(
    `Test helper 'getQueueInPhase' expects the first argument to be an Igniter phase, received ${phase}`,
    phase instanceof Phase);

  let queue;

  try {
    queue = phase.queues.get(queueName);
  } catch (e) {
    throw new Error(`Test helper 'getQueueInPhase' could not locate the phase's queue map. This may indicate an API change to private internals.`);
  }

  assert(`Test helper 'getQueueInPhase' could not find the queue '${queueName}'.`, queue);

  return queue;
}
