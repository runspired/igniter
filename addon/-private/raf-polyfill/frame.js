import FastArray from 'perf-primitives/fast-array';
import Job from './job';

const now = performance.now;

export default class AnimationFrame {
  constructor() {
    this.jobs = new FastArray(20);
    this.forgotten = new FastArray(10);
  }

  schedule(work) {
    let job = new Job(work);

    this.jobs.push(job);

    return job.id;
  }

  forget(jobId) {
    this.forgotten.push(jobId);
  }

  flush() {
    let frameFlushTime = now();

    this.jobs.emptyEach((job) => {
      if (this.forgotten.contains(job)) {
        return;
      }
      job.execute(frameFlushTime);
      job.destroy();
    });

    this.forgotten.clear();

    return frameFlushTime;
  }
}
