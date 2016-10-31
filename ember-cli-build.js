/*jshint node:true*/

var path = require('path');
var existsSync = require('exists-sync');
var concat = require('broccoli-concat');
var merge = require('broccoli-merge-trees');
var typescript = require('broccoli-typescript-compiler');
var transpileES6 = require('emberjs-build/lib/utils/transpile-es6');
var stew = require('broccoli-stew');
var TSLint = require('broccoli-tslinter');
var mv = stew.mv;
var find = stew.find;
var rename = stew.rename;

function transpile(tree, options, label) {
  return transpileES6(tree, label, options);
}

function buildTSOptions(compilerOptions) {
  var tsOptions = {
    tsconfig: {
      compilerOptions: {
        target: "es2015",
        inlineSourceMap: true,
        inlineSources: true,
        moduleResolution: "node",

        /* needed to get typescript to emit the desired sourcemaps */
        rootDir: '.',
        mapRoot: '/'
      }
    }
  };

  Object.assign(tsOptions.tsconfig.compilerOptions, compilerOptions);

  return tsOptions;
}

function buildBabelOptions(options) {
  var externalHelpers = options.shouldExternalizeHelpers || false;
  var stripRuntimeChecks = options.stripRuntimeChecks || false;

  return {
    externalHelpers: externalHelpers,
    stripRuntimeChecks: stripRuntimeChecks,
    sourceMaps: 'inline'
  };
}

module.exports = function(_options) {
  var options = _options || {};
  var packages = __dirname + '/packages';
  var tslintConfig = __dirname + '/tslint.json';
  var bower = __dirname + '/bower_components';
  var hasBower = existsSync(bower);
  var babelOptions = buildBabelOptions(options);

  var tsOptions = buildTSOptions();

  var benchmarkTrees = [find(__dirname + '/bench', {
    include: ['*.html'],
    destDir: 'bench'
  })];

  var benchmarkPath = __dirname + '/node_modules/benchmark';

  if (existsSync(benchmarkPath)) {
    benchmarkTrees.push(find(benchmarkPath, {
      include: ['benchmark.js'],
      destDir: 'bench'
    }));
  }

  var demos = find(__dirname + '/demos', {
    include: ['*.html'],
    destDir: 'demos'
  });

  /*
   * ES6 Build
   */
  var tsTree = find(packages, {
    include: ['**/*.ts'],
    exclude: ['**/*.d.ts']
  });

  var tsLintTree = new TSLint(tsTree, {
    configuration: tslintConfig
  });
  /* tslint:enable:no-unused-variable */
  var transpiledTSLintTree = typescript(tsLintTree, tsOptions);

  var jsTree = typescript(tsTree, tsOptions);

  var libTree = find(jsTree, {
    include: ['*/index.js', '*/lib/**/*.js']
  });

  var es6LibTree = mv(libTree, 'es6');

  /*
   * ES5 Named AMD Build
   */
  libTree = transpile(libTree, babelOptions, 'ES5 Lib Tree');
  var es5LibTree = mv(libTree, 'named-amd');

  /*
   * CommonJS Build
   */
  tsOptions = buildTSOptions({
    module: "commonjs",
    target: "es5"
  });

  var cjsTree = typescript(tsTree, tsOptions);

  // igniter packages require other igniter packages using non-relative module names
  // (e.g., `igniter-test-helpers` may import `igniter-runtime` instead of `../igniter-test-helpers`),
  // which doesn't work with Node's module resolution strategy.
  // As a workaround, naming the CommonJS directory `node_modules` allows us to treat each
  // package inside as a top-level module.
  cjsTree = mv(cjsTree, 'node_modules');

  /*
   * Anonymous AMD Build
   */
  var igniterRuntime = find(libTree, {
    include: ['igniter-runtime/**/*', 'igniter-debug/**/*']
  });

  var igniterDemos = merge([
    find(libTree, {
      include: [
        'igniter-test-helpers/**/*.js',
        'igniter-demos/**/*.js',
      ]
    })
  ]);

  var igniterBenchmarks = merge([
    find(libTree, {
      include: [
        'igniter-test-helpers/**/*.js',
        'igniter-benchmarks/**/*.js',
      ]
    })
  ]);

  var igniterTests = merge([
    transpiledTSLintTree,
    find(jsTree, { include: ['*/tests/**/*.js'], exclude: ['igniter-node/tests/**/*.js'] }),
    find(jsTree, { include: ['igniter-test-helpers/**/*.js'] })
  ]);

  igniterTests = transpile(igniterTests, babelOptions, 'igniter-tests');

  // Test Assets

  var testHarnessTrees = [
    find(__dirname + '/tests', {
      srcDir: '/',
      files: [ 'index.html' ],
      destDir: '/tests'
    })
  ];

  if (hasBower) {
    testHarnessTrees.push(find(bower, {
      srcDir: '/qunit/qunit',
      destDir: '/tests'
    }));
  }

  var testHarness = merge(testHarnessTrees);

  igniterRuntime = concat(igniterRuntime, {
    inputFiles: ['**/*.js'],
    outputFile: '/amd/igniter-runtime.amd.js',
    sourceMapConfig: {
      enabled: true,
      cache: null,
      sourceRoot: '/'
    }
  });

  igniterDemos = concat(igniterDemos, {
    inputFiles: ['**/*.js'],
    outputFile: '/amd/igniter-demos.amd.js',
    sourceMapConfig: {
      enabled: true,
      cache: null,
      sourceRoot: '/'
    }
  });

  igniterBenchmarks = concat(igniterBenchmarks, {
    inputFiles: ['**/*.js'],
    outputFile: '/amd/igniter-benchmarks.amd.js',
    sourceMapConfig: {
      enabled: true,
      cache: null,
      sourceRoot: '/'
    }
  });

  igniterTests = concat(igniterTests, {
    inputFiles: ['**/*.js'],
    outputFile: '/amd/igniter-tests.amd.js',
    sourceMapConfig: {
      enabled: true,
      cache: null,
      sourceRoot: '/'
    }
  });

  var finalTrees = [
    testHarness,
    demos,
    merge(benchmarkTrees),
    igniterRuntime,
    igniterTests,
    igniterDemos,
    igniterBenchmarks,
    cjsTree,
    es5LibTree,
    es6LibTree
  ];

  if (hasBower) {
    var loader = find(__dirname + '/node_modules', {
      srcDir: '/loader.js/lib/loader',
      files: [ 'loader.js' ],
      destDir: '/assets'
    });

    finalTrees.push(loader);
  }

  return merge(finalTrees);
};
