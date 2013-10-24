/*
 * grunt-mocha-protractor
 * https://github.com/aeh/grunt-mocha-protractor
 */

'use strict';

var webdriver = require('selenium-webdriver'),
    protractor = require('protractor'),
    runner = require('../lib/runner'),
    reporter = require('../lib/reporter'),
    Mocha = require('mocha'),
    mochaAsPromised = require('mocha-as-promised'),
    path = require('path'),
    Module = require('module'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised')

mochaAsPromised(Mocha);

module.exports = function(grunt) {
  grunt.registerMultiTask('mochaProtractor', 'Run e2e angular tests with webdriver.', function() {
    var files = this.files,
        options = this.options({
          browsers: ['Chrome'],
          reporter: 'Spec',
          baseUrl : '',
          args: null
        });

    // wrap reporter
    options.reporter = reporter(options.reporter);

    grunt.util.async.forEachSeries(options.browsers, function(browser, next) {
      if (typeof webdriver.Capabilities[browser.toLowerCase()] !== 'function') {
        grunt.log.error('Unknown brower type: "' + browser + '"');
        return next(false);
      }

      grunt.util.async.forEachSeries(files, function(fileGroup, next) {
        runner(grunt, fileGroup, browser, options, next);
      }, next);
    }, this.async());
  });
};
