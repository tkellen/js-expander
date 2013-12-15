/*
 * expander
 * http://github.com/tkellen/expander
 *
 * Copyright (c) 2013 Tyler Kellen
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var getobject = require('getobject');

// exported object
var expander = module.exports = {};

// match these: <%= foo %> and <%= foo.bar %>
// but not these: <%= foo() %> or <%= foo.bar() %>
expander.tmplRegExp = /\s*(?:\${\s*([a-z0-9_]+(?:\.[a-z0-9_]+)*)\s*}|<%=\s*([a-z0-9_]+(?:\.[a-z0-9_]+)*)\s*%>)\s*/i;

// match these: <%= foo() %> and <%= foo.bar() %>
expander.fnTmplRegExp = /^\s*(?:\${\s*([a-z0-9_]+(?:\.[a-z0-9_]+)*\s*\(\s*[^\)]*\))\s*}|<%=\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*\s*\(\s*[^\)]*\))\s*%>)\s*/i;

// inspect string for lookups that satisfy the above regexp
expander.findProperty = function (lookup) {
  var matches = false;
  if(matches = expander.tmplRegExp.exec(lookup)) {
    return {
      type: 'property',
      src: matches && matches[0],
      prop: matches && matches[1] || matches[2]
    };
  } else if(matches = expander.fnTmplRegExp.exec(lookup)) {
    return {
      type: 'function',
      src: matches && matches[0],
      prop: matches && matches[1] || matches[2]
    };
  } else {
    return false;
  }
};

// set a heuristic indicating the method should be expanded
expander.fn = function(method) {
  method.__expanderFn__ = true;
  return method;
};

// recursively expand a string until it doesn't contain any template strings
expander.stringExpand = function (data, lookup) {
  var property;
  // as long as this contains a template string, keep traversing
  while(property = expander.findProperty(lookup)) {
    // if this doesn't solely contain a template lookup (e.g. '<%= key %>'), then
    // recursively process it as a template to handle interpolated strings (e.g. 'hi <%= key %>).
    if(property.src !== lookup) {
      lookup = _.template(lookup, data);
    } else {
      switch(property.type) {
        case 'property':
          // expand to the literal value of this key
          lookup = expander.process(data, getobject.get(data, property.prop));
          break;
        case 'function':
          lookup = expander.process(data, expander.functionExpand(data, property.prop));
          break;
      }
    }
  }
  return lookup;
};

// recursively expand an array until it doesn't contain any template strings
expander.arrayExpand = function (data, arr) {
  return arr.map(function(lookup) {
    return expander.process(data, lookup);
  });
};

// recursively expand an object, resolving its template strings
expander.objectExpand = function (data, obj) {
  var result = {};
  Object.keys(obj).forEach(function(key) {
    result[key] = expander.process(data, obj[key]);
  });
  return result;
};

expander.functionExpand = function (data, fn) {
  var fnBody = 'with(data) { return ' + fn + '; };';
  var results = Function(['data', '_'], fnBody).apply(undefined, [data, _]);  // jshint ignore:line
  return results;
};

// expand any type of legal lookup
expander.process = function (data, lookup) {
  if(_.isFunction(lookup) && lookup.__expanderFn__ === true) {
    return lookup.call(this, data);
  } else if(_.isString(lookup)) {
    return expander.stringExpand(data, lookup);
  } else if(_.isArray(lookup)) {
    return expander.arrayExpand(data, lookup);
  } else if(_.isPlainObject(lookup)) {
    return expander.objectExpand(data, lookup);
  } else {
    return lookup;
  }
};

// get the literal value of a key as referenced by a dot-notated string
expander.getRaw = function (data, lookup) {
  if(!lookup) {
    return data;
  } else {
    return getobject.get(data, lookup);
  }
};

// get the expanded value of a key as referenced by a dot-notated string
expander.get = function(data, lookup) {
  if (!lookup) {
    return expander.objectExpand(data, data);
  } else {
    return expander.process(data, getobject.get(data, lookup));
  }
};
