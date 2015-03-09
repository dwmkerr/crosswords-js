var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var stylish = require('jshint-stylish');
var karma = require('karma').server;
var express = require('express');
var path = require('path');
var connectLivereload = require('connect-livereload');
var opn = require('opn');

//  Copies vendor files over.
gulp.task('vendor', function() {
  gulp.src('./bower_components/angular/angular.js')
    .pipe(gulp.dest('./samples/vendor/angular'));
  gulp.src('./bower_components/bootstrap/dist/**/*.*')
    .pipe(gulp.dest('./samples/vendor/bootstrap'));
  gulp.src('./bower_components/jquery/dist/**/*.*')
    .pipe(gulp.dest('./samples/vendor/jquery'));
});

//  Builds the js code.
gulp.task('js', function() {

  return gulp.src(['src/crossword.js', 'src/crossworddom.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('crosswords.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'));

});

//  Builds the css.
gulp.task('css', function() {

  return gulp.src('src/crosswords.less')
    .pipe(less())
    .pipe(gulp.dest('./dist'))
    .pipe(minifyCss())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist'));

});

//  Hints all of the javascript.
gulp.task('jshint', function() {

  return gulp.src(['src/crosswords.js', 'test/**/*.spec.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));

});

//  Starts the express server.
gulp.task('serve', function() {

  //  Create the app. Serve the samples and the dist.
  var app = express();
  app.use(connectLivereload());
  app.use(express.static(path.join(__dirname, 'samples')));
  app.use(express.static(path.join(__dirname, 'dist')));
  app.listen(3000);
  console.log('Exchange cross words on port 3000');

});

//  Starts the livereload server.
var tinylr;
gulp.task('livereload', function() {
  tinylr = require('tiny-lr')();
  tinylr.listen(35729);
});

function notifyLiveReload(event) {

  var fileName = path.relative(__dirname, event.path);

  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('test', function (done) {
  karma.start({
    configFile: path.join(__dirname, './karma.conf.js'),
    singleRun: true
  }, done);
});

gulp.task('test-debug', function (done) {
  karma.start({
    configFile: path.join(__dirname, './karma.conf.js'),
    singleRun: false,
    browsers: ['Chrome'],
    autoWatch: true
  }, done);
});

//  Sets up watchers.
gulp.task('watch', function() {

  //  When our source js/less changes, rebuild it.
  gulp.watch(['src/**.js'], ['jshint', 'js']);
  gulp.watch(['src/**.less'], ['css']);

  //  When our built js or tests change, retest and livereload.
  gulp.watch(['dist/*.js', 'test/**/*.spec.js'], ['test'], notifyLiveReload);
  gulp.watch(['dist/*.css', 'samples/**/*.*'], notifyLiveReload);

});

gulp.task('default', ['vendor', 'js', 'css', 'serve', 'livereload', 'watch'], function() {
  opn('http://localhost:3000');
});
