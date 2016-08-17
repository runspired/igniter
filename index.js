/* jshint node: true */
// jscs:disable
'use strict';

module.exports = {
  name: 'igniter',

  included: function(app) {
    app.import('./vendor/-override-backburner.js', { prepend: false });
  },

  isDevelopingAddon: function() {
    return true;
  }

};
