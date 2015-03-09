module.exports = function(config) {
  config.set({

    basePath: '',

    files: [
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
      'src/crossword.js',
      'src/crossworddom.js',
      'test/**/*.spec.js',

      //  JSON Fixtures
      {
        pattern: 'test/data/**/*.json',
        watched: true,
        served: true,
        included: false
      }
    ],

    frameworks: ['jasmine'],
    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: false
  });
};
