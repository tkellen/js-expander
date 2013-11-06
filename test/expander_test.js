'use strict';

var expander = require('../lib/expander');
var _ = require('lodash');

exports['expander'] = {
  setUp: function(done) {
    this.config = {
      key: 'value',
      keyRef: '<%= key %>',
      recursiveKeyRef: '<%= keyRef %>',
      arrayRef: ['test', '<%= key %>'],
      recursiveArrayRef: ['test', '<%= arrayRef %>'],
      obj: {
        keyRef: '<%= key %>',
        recursiveKeyRef: '<%= keyRef %>',
        arrayRef: ['test', '<%= key %>'],
        recursiveArrayRef: ['test', '<%= arrayRef %>']
      },
      objRef: '<%= obj %>',
      interpolated: 'test <%= key %>',
      interpolatedRecursiveRef: 'test <%= keyRef %>'
    };

    done();
  },
  'expander.get': function (test) {
    test.expect(7);
    test.equal(expander.get('keyRef', this.config), 'value', 'should expand template strings');
    test.equal(expander.get('recursiveKeyRef', this.config), 'value', 'should recursively expand template strings');
    test.deepEqual(expander.get('arrayRef', this.config), ['test', 'value'], 'should expand template strings in arrays');
    test.deepEqual(expander.get('recursiveArrayRef', this.config), ['test', ['test', 'value']], 'should recursively expand template strings in arrays');
    test.deepEqual(expander.get('obj', this.config), {
      keyRef: 'value',
      recursiveKeyRef: 'value',
      arrayRef: ['test', 'value'],
      recursiveArrayRef: ['test', ['test', 'value']]
    }, 'should recursively expand template strings in arrays');
    test.deepEqual(expander.get('objRef', this.config), {
      keyRef: 'value',
      recursiveKeyRef: 'value',
      arrayRef: ['test', 'value'],
      recursiveArrayRef: ['test', ['test', 'value']]
    }, 'should recursively expand template strings in arrays');
    test.equal(expander.get('interpolated', this.config), 'test value', 'should expand interpolated template strings');
    test.done();
  }
};
