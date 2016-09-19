import Igniter from 'igniter';
import assert from './assert';

/**
 *
 * @param {Igniter} instance
 * @param {String} queueName
 * @returns {Phase} Igniter engine phase (Idle, Render, Measure, Event)
 */
export default function getPhaseForQueue(instance, queueName) {
  assert(
    `Test helper 'getPhaseForQueue' expects the first argument to be an Igniter instance, received ${queueName}`,
    instance instanceof Igniter);
  assert(
    `Test helper 'getPhaseForQueue' expects the second argument to be a queueName, received ${queueName}`,
    queueName && typeof queueName === 'string'
  );

  let phaseName;
  let phase;

  try {
    phaseName = instance.engine.queueMap[queueName];
  } catch (e) {
    throw new Error(`Test helper 'getPhaseForQueue' could not locate Igniter's queue map. This may indicate an API change to private internals.`);
  }

  assert(`Test helper 'getPhaseForQueue' could not find the queue '${queueName}'.`, phaseName);

  try {
    phase = instance.engine.phases[phaseName];
  } catch (e) {
    throw new Error(`Test helper 'getPhaseForQueue' could not locate Igniter's phases. This may indicate an API change to private internals.`);
  }

  assert(`Test helper 'getPhaseForQueue' could not find the frame '${phaseName}' for queue '${queueName}'.`, phase);

  return phase;
}
