# expander [![Build Status](https://secure.travis-ci.org/tkellen/node-expander.png?branch=master)](http://travis-ci.org/tkellen/node-expander)

> Expand template strings in declarative configurations.

## Examples

```js
var expander = require('expander');

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

expander.get(data, 'keyRef'); // value
expander.get(data, 'recursiveKeyRef'); // value
expander.get(data, 'arrayRef'); // ['test', 'value']
expander.get(data, 'recursiveArrayRef'); // ['test', ['test', 'value']]
expander.get(data, 'obj'); // {
                           //   keyRef: 'value',
                           //   recursiveKeyRef: 'value',
                           //   arrayRef: ['test', 'value'],
                           //   recursiveArrayRef: ['test', ['test', 'value']]
                           // }
expander.get(data, 'objRef'); // {
                              //   keyRef: 'value',
                              //   recursiveKeyRef: 'value',
                              //   arrayRef: ['test', 'value'],
                              //   recursiveArrayRef: ['test', ['test', 'value']]
                              // }
expander.get(data, 'interpolated'); // test value
expander.get(data, 'interpolatedRecursiveRef'); // test value
```

## Release History

* 2013-11-21 - v0.2.1 - support ${value} strings
* 2013-11-08 - v0.2.0 - correctly handle recursively interpolated values
* 2013-11-05 - v0.1.0 - initial release