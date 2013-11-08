'use strict';

var expander = require('../lib/expander');

var data = {
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

var dataExpanded = {
  key: 'value',
  keyRef: 'value',
  recursiveKeyRef: 'value',
  arrayRef: [ 'test', 'value' ],
  recursiveArrayRef: [ 'test', [ 'test', 'value' ] ],
  obj: {
    keyRef: 'value',
    recursiveKeyRef: 'value',
    arrayRef: [ 'test', 'value' ],
    recursiveArrayRef: [ 'test', [ 'test', 'value' ] ]
  },
  objRef: {
    keyRef: 'value',
    recursiveKeyRef: 'value',
    arrayRef: [ 'test', 'value' ],
    recursiveArrayRef: [ 'test', [ 'test', 'value' ] ]
  },
  interpolated: 'test value',
  interpolatedRecursiveRef: 'test value'
};

exports['expander'] = {
  'expander.get': function (test) {
    test.expect(8);
    test.deepEqual(expander.get(data), dataExpanded, 'should expand the entire object if no lookup is defined');
    test.equal(expander.get(data, 'keyRef'), 'value', 'should expand template strings');
    test.equal(expander.get(data, 'recursiveKeyRef'), 'value', 'should recursively expand template strings');
    test.deepEqual(expander.get(data, 'arrayRef'), ['test', 'value'], 'should expand template strings in arrays');
    test.deepEqual(expander.get(data, 'recursiveArrayRef'), ['test', ['test', 'value']], 'should recursively expand template strings in arrays');
    test.deepEqual(expander.get(data, 'obj'), {
      keyRef: 'value',
      recursiveKeyRef: 'value',
      arrayRef: ['test', 'value'],
      recursiveArrayRef: ['test', ['test', 'value']]
    }, 'should recursively expand template strings in arrays');
    test.deepEqual(expander.get(data, 'objRef'), {
      keyRef: 'value',
      recursiveKeyRef: 'value',
      arrayRef: ['test', 'value'],
      recursiveArrayRef: ['test', ['test', 'value']]
    }, 'should recursively expand template strings in arrays');
    test.equal(expander.get(data, 'interpolated'), 'test value', 'should expand interpolated template strings');
    test.done();
  }
};
