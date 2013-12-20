/*
 * grunt-mocha-protractor
 * https://github.com/noblesamurai/grunt-mocha-protractor
 */

'use strict';

var Mocha = require('mocha'),
    mochaAsPromised = require('mocha-as-promised'),
    util = require('util'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    Base = Mocha.reporters.Base,
    cursor = Base.cursor,
    color = Base.color;

mochaAsPromised(Mocha);

module.exports = function(reporter) {
  var Reporter = null

  if (Mocha.reporters[reporter]) {
    // find the requested reporter...
    var reporterClass = Base;
    Object.keys(Mocha.reporters).forEach(function(key) {
      if (key.toLowerCase() === reporter.toLowerCase()) {
        reporterClass = key;
      }
    });

    Reporter = function (runner) {
      Mocha.reporters[reporterClass].call(this, runner);

      var self = this;

      var listeners = runner.listeners('suite');
      runner.removeAllListeners('suite');
      runner.on('suite', function(suite) {
        suite.tests.forEach(function(test) {
          var browser = suite.ctx.browser;
          if (typeof browser === 'object') {
            browser = browser.browserName +
              (browser.version ? ' ' + browser.version : '') +
              (browser.platform ? ' on ' + browser.platform : '');
          }
          test.title = '[' + browser + '] ' + test.title;
        });

        listeners.forEach(function(listener) {
          listener.call(self, suite);
        });
      });
    }

    /**
     * Inherit from `Base.prototype`
     */
    util.inherits(Reporter, Mocha.reporters[reporterClass]);
    return Reporter;
  } else {

    var p;
    try {
      p = require.resolve(reporter);
    }
    catch (e) {
      // Resolve to local path
      p = path.resolve(reporter);
    }
    if (p) {
      try {
        Reporter = require(p);
      }
      catch (e) { }
    }
  }

  if (Reporter === null) {
    grunt.fatal('Specified reporter is unknown or unresolvable: ' + reporter);
  }

  return Reporter
};
