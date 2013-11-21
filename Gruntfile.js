'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/*.js']
    },
    watch: {
      lib: {
        files: ['lib/*','test/*'],
        tasks: ['default']
      }
    },
    nodeunit: {
      files: ['test/**/*_test.js'],
    }
  });

  // Load plugins.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit']);
};
