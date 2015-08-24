'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var conf = require('./conf');
var path = require('path');

var electronServer = require('electron-connect').server;


/**
 * privides http server (run with JSPM)
 * 	root: src dir for application
 * 	watching:
 * 		- all files under src dir
 */
gulp.task('serve', function() {
  // start http server
  gulp.src(conf.paths.src)
    .pipe($.webserver({
      host: '0.0.0.0',
      port: 3000,
      livereload: true,
      open: 'http://localhost:3000/index.dev.html'
    }));
});

/**
 * privides http server (run with Self-Executing (SFX) Bundles generated by JSPM)
 * 	root: dist dir
 * 	watching:
 * 		- all files under dist dir
 * 		- all ts,html,less files under src dir
 */
gulp.task('serve:dist', ['build'], function() {
  // start http server
  gulp.src(conf.paths.dist)
    .pipe($.webserver({
      host: '0.0.0.0',
      port: 3000,
      livereload: true,
      open: 'http://localhost:3000/'
    }));

  // watch app src and rebuild
  gulp.watch([
    conf.paths.src + '/*.ts',
    conf.paths.src + '/!(jspm_packages)/**/*.ts'
  ], ['build:jspm:bundle-sfx']);
  gulp.watch([
    conf.paths.src + '/*.html',
    conf.paths.src + '/!(jspm_packages)/**/*.html'
  ], ['build:html']);
  gulp.watch([
    conf.paths.src + '/*.less',
    conf.paths.src + '/!(jspm_packages)/**/*.less'
  ], ['build:style']);
});

/**
 * privides electron server with application run with JSPM
 *  root: serve dir
 * 	approot: src dir for application
 * 	watching:
 * 		- src files for Electron
 * 		- all ts,html,less files under src dir
 */
gulp.task('serve:electron', ['transpile:electron'], function () {
  // switch the pathToApp for BrowserWindow.loadUrl(url) according to the value of NODE_ENV
  $.env({
    vars: {
      APP_RELATIVE_PATH: path.relative(conf.paths.serve, conf.files.indexFileDev)
    }
  });

  var electron = electronServer.create({
    path: conf.paths.serve + "/main.js"
  });
  electron.start();

  // watch electron src and re-transpile
  gulp.watch([conf.paths.srcElectron + '/**/*.js'], ['transpile:electron']);
  // watch serve dir and restart electron
  gulp.watch([conf.paths.serve + '/**/*.js'], electron.restart);
  // watch app src and reload electron
  gulp.watch([
    conf.paths.src + '/*.ts',
    conf.paths.src + '/*.html',
    conf.paths.src + '/*.less',
    conf.paths.src + '/!(jspm_packages)/**/*.ts',
    conf.paths.src + '/!(jspm_packages)/**/*.html',
    conf.paths.src + '/!(jspm_packages)/**/*.less',
  ], electron.reload);
});

/**
 * privides electron server with application run with Self-Executing (SFX) Bundles generated by JSPM
 * 	root: dist dir
 * 	watching:
 * 		- (nothing)
 */
gulp.task('serve:dist:electron', ['build'], function () {
  electronServer.create({
    path: conf.paths.dist + "/main.js"
  }).start();
});
