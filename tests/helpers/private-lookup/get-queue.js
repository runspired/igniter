import getPhaseForQueue from './get-phase-for-queue';
import assert from './assert';

/**
 * @public
 * @param {Igniter} instance
 * @param {String} queueName
 * @returns {FastArray} queue
 */
export default function getQueue(instance, queueName) {
  let phase = getPhaseForQueue(instance, queueName);
  let queue;

  try {
    queue = phase.queues.get(queueName);
  } catch (e) {
    throw new Error(`Test helper 'getQueue' could not locate the queue '${queueName}' this` +
     ` likely indicates a change to private internal APIs.`);
  }

  assert(
    `Test helper 'getQueue' could not locate the queue '${queueName}' within the phase ${phase.name},` +
    ` this queue is likely missing from the phase.`, queue);

  return queue;
}
