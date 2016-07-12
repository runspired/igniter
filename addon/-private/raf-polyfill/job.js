import FastArray from 'perf-primitives/fast-array';
const JOB_RECYCLE_POOL = new FastArray(20, 'Job Recycle Pool');
let JOB_ID = 1;
const UNINITIALIZED_JOB_ID = 0;

function Job(work) {
  this.init(work);
}

Job.prototype.init = function initJob(work) {
  this.work = work;
  this.id = JOB_ID++;
};

Job.prototype.create = function createJob(work) {
  let job = JOB_RECYCLE_POOL.pop();

  if (job) {
    return job.init(work);
  }

  return new Job(work);
};

Job.prototype.destroy = function destroyJob() {
  this.work = undefined;
  this.id = UNINITIALIZED_JOB_ID;
};

Job.prototype.execute = function executeJob(time) {
  this.job.call(undefined, time);
};

export default Job;
