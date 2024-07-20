"use strict";

// Include gulp
let gulp = require('gulp');

let uglify = require('gulp-uglify');
let babel = require('gulp-babel');
let uglifycss = require('gulp-uglifycss');
let concat = require('gulp-concat');

gulp.task('dist', function() {
  
  gulp.src(['src/js/common/*.js', 'src/js/widget/*.js'])
    .pipe(concat('./gux.desktop.js'))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/js/common/*.js', 'src/js/widget/*.js'])
    .pipe(babel({
      presets: [['@babel/preset-env', {modules: false}]]
    }))
    .pipe(concat('./gux.desktop.min.js'))
    .pipe(uglify({}))
    .pipe(gulp.dest('./dist/'));

  // desktop css
  gulp.src(['src/css/gux.css'])
    .pipe(concat('./gux.desktop.css'))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/css/gux.css'])
      .pipe(concat('./gux.desktop.min.css'))
      .pipe(uglifycss())
      .pipe(gulp.dest('./dist/'));
});

// gulp.task('default', ['compress', 'specs']);
gulp.task('dist');