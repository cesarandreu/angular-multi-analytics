'use strict';

var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  karma = require('karma').server,
  _ = require('lodash');

gulp.task('test', function (done) {
  karma.start(_.assign({}, require('./karma.conf.js')(), {singleRun: true}), done);
});

gulp.task('tdd', function (done) {
  karma.start(require('./karma.conf.js')(), done);
});

gulp.task('copy', function () {
  return gulp.src('src/{,*/}*.js')
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['copy'], function () {
  return gulp.src('src/{,*/}*.js')
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist'));
});
