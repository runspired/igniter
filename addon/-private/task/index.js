import { stripInProduction } from 'igniter/-debug';
import Promise from '../promise';

export function createWrappedTask(job, token) {
  let work = () => {
    if (token.cancelled === false) {
      job();
    }
  };
  let wrappedTask = work;

  stripInProduction(() => {
    new Promise((resolve) => {
      wrappedTask = resolve;
    }).then(work);
  });

  return wrappedTask;
}
