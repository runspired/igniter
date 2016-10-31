import { Igniter } from 'igniter-runtime';
import assert from './assert';

/**
 * @public
 * @param {Igniter} instance
 * @param {String} phaseName
 * @returns {Phase} Igniter engine phase (Idle, Render, Measure, Event)
 */
export default function getPhase(instance, phaseName) {
  assert(
    `Test helper 'getPhase' expects the first argument to be an Igniter instance, received ${instance}`,
    instance instanceof Igniter);
  assert(
    `Test helper 'getPhase' expects the second argument to be a phaseName, received ${phaseName}`,
    phaseName && typeof phaseName === 'string'
  );

  let phase;

  try {
    phase = instance.engine.phases[phaseName];
  } catch (e) {
    throw new Error(`Test helper 'getPhase' could not locate Igniter's phases. This may indicate an API change to private internals.`);
  }

  assert(`Test helper 'getPhase' could not find the phase '${phaseName}'.`, phase);

  return phase;
}
