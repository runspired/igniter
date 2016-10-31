
/*
 This requires a test environment with true requestAnimationFrame
 to work at the moment.

 This is currently a "dumb" approach to waiting for frame tasks to complete,
 as we're just assuming that we want to see state at some point after, not
 immediately after.  Once we've made Igniter hookabe, this should tap into
 the engine.
 */
export default function(callback) {
  requestAnimationFrame(callback);
}
