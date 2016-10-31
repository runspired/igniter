export function createWrappedTask(job, token) {
  return () => {
    if (token.cancelled === false) {
      job();
    }
  };
}
