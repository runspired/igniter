export {
  getQueue,
  getPhaseForQueue,
  getPhase,
  getQueueInPhase,
  getCurrentPhase
} from './lib/private-lookup';

import afterMicrotasks from './lib/after-microtasks';
import afterFrametasks from './lib/after-frametasks';
import module from './lib/qunit/module';

const test = QUnit.test;

export {
  afterMicrotasks,
  afterFrametasks,
  module,
  test
};
