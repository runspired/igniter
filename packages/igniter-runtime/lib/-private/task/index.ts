export function createWrappedTask(job, token): Function {
  return () => {
    if (token.cancelled === false) {
      job();
    }
  };
}
