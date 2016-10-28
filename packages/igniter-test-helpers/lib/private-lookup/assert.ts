export default function assert(message, test) {
  if (!test) {
    throw new Error(message);
  }
}
