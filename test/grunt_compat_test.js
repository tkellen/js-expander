'use strict';

var expander = require('../lib/expander');
var config = {
  meta: {
    "foo": "bar",
    "baz": [1, 2, 3]
  },
  foo: '<%= meta.foo %>',
  foo2: '<%= foo %>',
  obj: {
    foo: '<%= meta.foo %>',
    foo2: '<%= obj.foo %>',
    Arr: ['foo', '<%= obj.foo2 %>'],
    arr2: ['<%= arr %>', '<%= obj.Arr %>'],
  },
  bar: 'bar',
  arr: ['foo', '<%= obj.foo2 %>'],
  arr2: ['<%= arr %>', '<%= obj.Arr %>'],
};

var grunt = {
  config: {
    getRaw: function (path) {
      return expander.getRaw(path, config);
    },
    get: function (path) {
      return expander.get(path, config);
    },
    process: function (str) {
      return expander.expand(str, config);
    }
  }
};

exports['config'] = {
  'config.getRaw': function(test) {
    test.expect(4);
    test.equal(grunt.config.getRaw('foo'), '<%= meta.foo %>', 'Should not process templates.');
    test.equal(grunt.config.getRaw('obj.foo2'), '<%= obj.foo %>', 'Should not process templates.');
    test.equal(grunt.config.getRaw(['obj', 'foo2']), '<%= obj.foo %>', 'Should not process templates.');
    test.deepEqual(grunt.config.getRaw('arr'), ['foo', '<%= obj.foo2 %>'], 'Should not process templates.');
    test.done();
  },
  'config.process': function(test) {
    test.expect(5);
    test.equal(grunt.config.process('<%= meta.foo %>'), 'bar', 'Should process templates.');
    test.equal(grunt.config.process('<%= foo %>'), 'bar', 'Should process templates recursively.');
    test.equal(grunt.config.process('<%= obj.foo %>'), 'bar', 'Should process deeply nested templates recursively.');
    test.deepEqual(grunt.config.process(['foo', '<%= obj.foo2 %>']), ['foo', 'bar'], 'Should process templates in arrays.');
    test.deepEqual(grunt.config.process(['<%= arr %>', '<%= obj.Arr %>']), [['foo', 'bar'], ['foo', 'bar']], 'Should expand <%= arr %> and <%= obj.Arr %> values as objects if possible.');
    test.done();
  },
  'config.get': function(test) {
    test.expect(8);
    test.equal(grunt.config.get('foo'), 'bar', 'Should process templates.');
    test.equal(grunt.config.get('foo2'), 'bar', 'Should process templates recursively.');
    test.equal(grunt.config.get('obj.foo2'), 'bar', 'Should process deeply nested templates recursively.');
    test.equal(grunt.config.get(['obj', 'foo2']), 'bar', 'Should process deeply nested templates recursively.');
    test.deepEqual(grunt.config.get('arr'), ['foo', 'bar'], 'Should process templates in arrays.');
    test.deepEqual(grunt.config.get('obj.Arr'), ['foo', 'bar'], 'Should process templates in arrays.');
    test.deepEqual(grunt.config.get('arr2'), [['foo', 'bar'], ['foo', 'bar']], 'Should expand <%= arr %> and <%= obj.Arr %> values as objects if possible.');
    test.deepEqual(grunt.config.get(['obj', 'arr2']), [['foo', 'bar'], ['foo', 'bar']], 'Should expand <%= arr %> and <%= obj.Arr %> values as objects if possible.');
    test.done();
  }
};
