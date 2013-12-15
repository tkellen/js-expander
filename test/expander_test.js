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
  dotRef: '<%= obj.keyRef %>',
  objRef: '<%= obj %>',
  interpolated: 'test <%= key %>',
  interpolatedRecursiveRef: 'test <%= keyRef %>',
  methodRef: expander.fn(function(config) {
    return config.key;
  }),
  methodRefContext: expander.fn(function(config) {
    return this.get(config, 'keyRef');
  }),

  _key: 'value',
  _keyRef: '${_key}',
  _recursiveKeyRef: '${_keyRef}',
  _arrayRef: ['test', '${_key}'],
  _recursiveArrayRef: ['test', '${_arrayRef}'],
  _obj: {
    _keyRef: '${_key}',
    _recursiveKeyRef: '${_keyRef}',
    _arrayRef: ['test', '${_key}'],
    _recursiveArrayRef: ['test', '${_arrayRef}']
  },
  _dotRef: '${ _obj._keyRef }',
  _objRef: '${_obj}',
  _interpolated: 'test ${ _key}',
  _interpolatedRecursiveRef: 'test ${_keyRef }'
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
  dotRef: 'value',
  objRef: {
    keyRef: 'value',
    recursiveKeyRef: 'value',
    arrayRef: [ 'test', 'value' ],
    recursiveArrayRef: [ 'test', [ 'test', 'value' ] ]
  },
  interpolated: 'test value',
  interpolatedRecursiveRef: 'test value',
  methodRef: 'value',
  methodRefContext: 'value',

  _key: 'value',
  _keyRef: 'value',
  _recursiveKeyRef: 'value',
  _arrayRef: [ 'test', 'value' ],
  _recursiveArrayRef: [ 'test', [ 'test', 'value' ] ],
  _obj: {
    _keyRef: 'value',
    _recursiveKeyRef: 'value',
    _arrayRef: [ 'test', 'value' ],
    _recursiveArrayRef: [ 'test', [ 'test', 'value' ] ]
  },
  _dotRef: 'value',
  _objRef: {
    _keyRef: 'value',
    _recursiveKeyRef: 'value',
    _arrayRef: [ 'test', 'value' ],
    _recursiveArrayRef: [ 'test', [ 'test', 'value' ] ]
  },
  _interpolated: 'test value',
  _interpolatedRecursiveRef: 'test value'
};

exports['expander'] = {
  'expander.get': function (test) {
    test.expect(19);
    test.deepEqual(expander.get(data), dataExpanded, 'should expand the entire object if no lookup is defined');

    // test <%= key %>
    test.equal(expander.get(data, 'keyRef'), dataExpanded.keyRef, 'should expand template strings');
    test.equal(expander.get(data, 'recursiveKeyRef'), dataExpanded.recursiveKeyRef, 'should recursively expand template strings');
    test.deepEqual(expander.get(data, 'arrayRef'), dataExpanded.arrayRef, 'should expand template strings in arrays');
    test.deepEqual(expander.get(data, 'recursiveArrayRef'), dataExpanded.recursiveArrayRef, 'should recursively expand template strings in arrays');
    test.deepEqual(expander.get(data, 'obj'), dataExpanded.obj, 'should recursively expand template strings in arrays');
    test.deepEqual(expander.get(data, 'dotRef'), dataExpanded.key, 'should expand template strings with dots');
    test.deepEqual(expander.get(data, 'objRef'), dataExpanded.objRef, 'should recursively expand template strings in arrays');
    test.equal(expander.get(data, 'interpolated'), dataExpanded.interpolated, 'should expand interpolated template strings');
    test.equal(expander.get(data, 'methodRef'), dataExpanded.key, 'should execute functions, passing in the config');
    test.equal(expander.get(data, 'methodRefContext'), dataExpanded.keyRef, 'should execute expander functions, passing in the config and setting context to expander');

    // test ${key}
    test.equal(expander.get(data, '_keyRef'), dataExpanded._keyRef, 'should expand template strings');
    test.equal(expander.get(data, '_recursiveKeyRef'), dataExpanded._recursiveKeyRef, 'should recursively expand template strings');
    test.deepEqual(expander.get(data, '_arrayRef'), dataExpanded._arrayRef, 'should expand template strings in arrays');
    test.deepEqual(expander.get(data, '_recursiveArrayRef'), dataExpanded._recursiveArrayRef, 'should recursively expand template strings in arrays');
    test.deepEqual(expander.get(data, '_obj'), dataExpanded._obj, 'should recursively expand template strings in arrays');
    test.deepEqual(expander.get(data, '_dotRef'), dataExpanded._key, 'should expand template strings with dots');
    test.deepEqual(expander.get(data, '_objRef'), dataExpanded._objRef, 'should recursively expand template strings in arrays');
    test.equal(expander.get(data, '_interpolated'), dataExpanded._interpolated, 'should expand interpolated template strings');

    test.done();
 }
};
