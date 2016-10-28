import { Igniter } from 'igniter-runtime';
import assert from './assert';

/**
 * @public
 * @param {Igniter} instance
 * @param {String} queueName
 * @returns {Phase} Igniter engine phase (Idle, Render, Measure, Event)
 */
export default function getPhaseForQueue(instance, queueName) {
  assert(
    `Test helper 'getPhaseForQueue' expects the first argument to be an Igniter instance, received ${instance}`,
    instance instanceof Igniter);
  assert(
    `Test helper 'getPhaseForQueue' expects the second argument to be a queueName, received ${queueName}`,
    queueName && typeof queueName === 'string'
  );

  let phase;

  try {
    if (queueName === 'cleanup') {
      phase = instance.engine.currentPhase || instance.engine.phases.event;
    } else {
      phase = instance.engine._mapQueueToPhase[queueName];
    }
  } catch (e) {
    throw new Error(`Test helper 'getPhaseForQueue' could not locate Igniter's queue map. This may indicate an API change to private internals.`);
  }

  assert(`Test helper 'getPhaseForQueue' could not find the queue '${queueName}'.`, phase);

  return phase;
}
