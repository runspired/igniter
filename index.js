/* jshint node: true */
// jscs:disable
'use strict';

var stripClassCallCheck = require('babel5-plugin-strip-class-callcheck');
var filterImports = require('babel-plugin-filter-imports');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'igniter',

  isDevelopingAddon: function() {
    return true;
  },

  init: function() {
    this._super.init && this._super.init.apply(this, arguments);

    this.options = this.options || {};
  },

  _hasSetupBabelOptions: false,
  _setupBabelOptions: function(env) {
    if (this._hasSetupBabelOptions) {
      return;
    }

    var babelOptions = this.options.babel = this.options.babel || {};

    babelOptions.plugins = babelOptions.plugins || [];
    babelOptions.plugins.push({transformer: stripClassCallCheck, position: 'after'});

    if (/production/.test(env)) {
      babelOptions.plugins.push(
        filterImports({
          'igniter/-debug': [
            'assert',
            'warn',
            'debug',
            'instrument',
            'deprecate',
            'stripInProduction',
            'developModeOnly',
            'conditionalDeprecation'
          ]
        })
      );
    }

    this._hasSetupBabelOptions = true;
  },

  included: function(app) {
    this._super.included.apply(this, arguments);

    this._setupBabelOptions(app.env);
  },

  treeForAddon: function() {
    var tree = this._super.treeForAddon.apply(this, arguments);

    if (/production/.test(this.app.env)) {
      tree = new Funnel(tree, { exclude: [ /-debug/ ] });
    }

    return tree;
  }
};
