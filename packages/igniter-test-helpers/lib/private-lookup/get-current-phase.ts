import { Igniter } from 'igniter-runtime';
import assert from './assert';

/**
 * @public
 * @param {Igniter} instance
 * @param {String} phaseName
 * @returns {Phase} Igniter engine phase (Idle, Render, Measure, Event)
 */
export default function getCurrentPhase(instance) {
  assert(
    `Test helper 'getPhase' expects the first argument to be an Igniter instance, received ${instance}`,
    instance instanceof Igniter);

  let phase;

  try {
    phase = instance.engine.currentPhase;
  } catch (e) {
    throw new Error(`Test helper 'getPhase' could not locate Igniter's phases. This may indicate an API change to private internals.`);
  }

  return phase;
}
