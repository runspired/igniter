import manager from './manager';

export function requestAnimationFrame(job) {
  return manager.schedule(job);
}

export function cancelAnimationFrame(jobId) {
  manager.forget(jobId);
}

export default manager;
