var
gulp     = require('gulp'),
babel    = require('gulp-babel'),
composer = require('gulp-uglify/composer'),
eslint   = require('gulp-eslint'),
rename   = require('gulp-rename'),
pump     = require('pump'),
uglify   = require('uglify-es'),

//  Uglify + ES6+
minify   = composer(uglify, console);

//  Task for finding errors and problems in Skrolla
gulp.task('eslint', () => {
  pump([
    gulp.src('src/skrolla.js'),
    eslint(),
    eslint.format(),
    eslint.failAfterError()
  ]);
});

//  Task for minifying the
//  ES6+ friendly version of Skrolla
gulp.task('minify', ['eslint'], () => {
  pump([
    gulp.src('src/skrolla.js'),
    minify(),
    rename('skrolla.js'),
    gulp.dest('dist')
  ]);
});

//  Task for running Skrolla through Babel,
//  and then minifying it for older browsers
gulp.task('babel', ['eslint'], () => {
  pump([
    gulp.src('src/skrolla.js'),
    babel(),
    minify(),
    rename('skrolla.babel.js'),
    gulp.dest('dist')
  ]);
});