require('mocha');
const expect = require('chai').expect;
const expander = require('../');

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

describe('expander', function () {
  describe('get', function () {
    // test <%= key %>
    it('should expand the entire object if no lookup is defined', function () {
      expect(expander.get(data)).to.deep.equal(dataExpanded);
    });
    it('should expand template strings', function () {
      expect(expander.get(data, 'keyRef')).to.equal(dataExpanded.keyRef);
    });
    it('should recursively expand template strings', function () {
      expect(expander.get(data, 'recursiveKeyRef')).to.equal(dataExpanded.recursiveKeyRef);
    });
    it('should expand template strings in arrays', function () {
      expect(expander.get(data, 'arrayRef')).to.deep.equal(dataExpanded.arrayRef);
    });
    it('should recursively expand template strings in arrays', function () {
      expect(expander.get(data, 'recursiveArrayRef')).to.deep.equal(dataExpanded.recursiveArrayRef);
    });
    it('should recursively expand template strings in arrays', function () {
      expect(expander.get(data, 'obj')).to.deep.equal(dataExpanded.obj);
    });
    it('should expand template strings with dots', function () {
      expect(expander.get(data, 'dotRef')).to.deep.equal(dataExpanded.key);
    });
    it('should recursively expand template strings in arrays', function () {
      expect(expander.get(data, 'objRef')).to.deep.equal(dataExpanded.objRef);
    });
    it('should expand interpolated template strings', function () {
      expect(expander.get(data, 'interpolated')).to.equal(dataExpanded.interpolated);
    });
    it('should execute functions, passing in the config', function () {
      expect(expander.get(data, 'methodRef')).equal(dataExpanded.key);
    });
    it('should execute expander functions, passing in the config and setting context to expander', function () {
      expect(expander.get(data, 'methodRefContext')).equal(dataExpanded.keyRef);
    });

    // test ${key}
    it('should expand template strings', function () {
      expect(expander.get(data, '_keyRef')).to.equal(dataExpanded._keyRef);
    });
    it('should recursively expand template strings', function () {
      expect(expander.get(data, '_recursiveKeyRef')).to.equal(dataExpanded._recursiveKeyRef);
    });
    it('should expand template strings in arrays', function () {
      expect(expander.get(data, '_arrayRef')).to.deep.equal(dataExpanded._arrayRef);
    });
    it('should recursively expand template strings in arrays', function () {
      expect(expander.get(data, '_recursiveArrayRef')).to.deep.equal(dataExpanded._recursiveArrayRef);
    });
    it('should recursively expand template strings in arrays', function () {
      expect(expander.get(data, '_obj')).to.deep.equal(dataExpanded._obj);
    });
    it('should expand template strings with dots', function () {
      expect(expander.get(data, '_dotRef')).to.deep.equal(dataExpanded._key);
    });
    it('should recursively expand template strings in arrays', function () {
      expect(expander.get(data, '_objRef')).to.deep.equal(dataExpanded._objRef);
    });
    it('should expand interpolated template strings', function () {
      expect(expander.get(data, '_interpolated')).to.equal(dataExpanded._interpolated);
    });
  });

  describe('interface', function () {
    it('should provided a getter/setter interface', function () {
      var config = expander.interface(data);
      expect(config('keyRef')).to.deep.equal(dataExpanded.keyRef);
      expect(config.get('recursiveKeyRef')).to.deep.equal(dataExpanded.recursiveKeyRef);
      config('keyRef', 'dude');
      expect(config('keyRef')).to.equal('dude');
    });

    it('should emit events when setting values', function (done) {
      var config = expander.interface(data);
      config.on('set', function () {
        done();
      });
      config('keyRef', 'dude');
    });
  });
});
