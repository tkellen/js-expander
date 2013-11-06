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
  objRef: '<%= obj %>',
  interpolated: 'test <%= key %>',
  interpolatedRecursiveRef: 'test <%= keyRef %>'
};
expander.get('keyRef', config); // value
expander.get('recursiveKeyRef', config); // value
expander.get('arrayRef', config); // ['test', 'value']
expander.get('recursiveArrayRef', config); // ['test', ['test', 'value']]
expander.get('obj', config); // {
                             //   keyRef: 'value',
                             //   recursiveKeyRef: 'value',
                             //   arrayRef: ['test', 'value'],
                             //   recursiveArrayRef: ['test', ['test', 'value']]
                             // }
expander.get('objRef', config); // {
                                //   keyRef: 'value',
                                //   recursiveKeyRef: 'value',
                                //   arrayRef: ['test', 'value'],
                                //   recursiveArrayRef: ['test', ['test', 'value']]
                                // }
expander.get('interpolated', config); // test value
expander.get('interpolatedRecursiveRef', config); // test value
```

## Release History

* 2013-11-05 - v0.1 - initial release