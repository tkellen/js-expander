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
  methodRef: expander.fn(function (config) {
    // config is the entire config
    return config.key;
  }),
  methodRefContext: expander.fn(function (config) {
    // this is a reference to expander
    return this.get(config, 'keyRef');
  })
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
expander.get(data, 'methodRef'); // value
expander.get(data, 'methodRefContext'); // value

// getter setter api
var config = expander.interface(config);
config('keyRef'); // value
config('recursiveKeyRef'); // value
config('arrayRef'); // ['test', 'value']
config('recursiveArrayRef'); // ['test', ['test', 'value']]
config('obj'); // {
               //   keyRef: 'value',
               //   recursiveKeyRef: 'value',
               //   arrayRef: ['test', 'value'],
               //   recursiveArrayRef: ['test', ['test', 'value']]
               // }
config('objRef'); // {
                  //   keyRef: 'value',
                  //   recursiveKeyRef: 'value',
                  //   arrayRef: ['test', 'value'],
                  //   recursiveArrayRef: ['test', ['test', 'value']]
                  // }
config('interpolated'); // test value
config('interpolatedRecursiveRef'); // test value
config('methodRef'); // value
config('methodRefContext'); // value
```

## Release History

* 2014-02-11 - v0.3.1 - interface emits events on set
* 2014-02-10 - v0.3.0 - support a getter/setter api
* 2013-12-15 - v0.2.2 - support auto expansion of functions
* 2013-11-21 - v0.2.1 - support ${value} strings
* 2013-11-08 - v0.2.0 - correctly handle recursively interpolated values
* 2013-11-05 - v0.1.0 - initial release
