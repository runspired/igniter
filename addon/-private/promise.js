import RSVP from 'rsvp';
import { stripInProduction } from './developer-ergonomics';

const { Promise: RSVPromise } = RSVP;
let PromiseClass = RSVPromise;

stripInProduction(() => {
  PromiseClass = typeof Promise !== 'undefined' ? Promise : RSVPromise;
});

export default PromiseClass;
