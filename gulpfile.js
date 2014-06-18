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

gulp.task('build', function () {
  return gulp.src('src/*')
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist'));
});
