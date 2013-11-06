/*
 * expander
 * http://github.com/tkellen/expander
 *
 * Copyright (c) 2013 Tyler Kellen
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var dotty = require('dotty');

// exported object
var expander = module.exports = {};

// match these: <%= foo %> and <%= foo.bar %>
// but not these: <%= foo() %> or <%= foo.bar() %>
expander.tmplRegExp = new RegExp('^<%=\\s*([a-z0-9_$]+(?:\\.[a-z0-9_$]+)*)\\s*%>$','i');

// inspect string for values that satisfy the above regexp
expander.findProperty = function (value) {
  var matches = expander.tmplRegExp.exec(value);
  if(matches) {
    return matches[1];
  } else {
    return false;
  }
};

// recursively expand a string until it doesn't contain any template strings
expander.stringExpand = function (value, data) {
  var property;
  // as long as this contains a template string, keep traversing
  while(property = expander.findProperty(value)) {
    // find the dot-notated value this key represents and expand it
    value = expander.expand(dotty.get(data, property), data);
  }
  return value;
};

// recursively expand an array until it doesn't contain any template strings
expander.arrayExpand = function (arr, data) {
  return arr.map(function(item) {
    return expander.expand(item, data);
  });
};

// recursively expand an object, resolving its template strings
expander.objectExpand = function (obj, data) {
  var result = {};
  Object.keys(obj).forEach(function(key) {
    result[key] = expander.expand(obj[key], data);
  });
  return result;
};

// expand any type of legal value
expander.expand = function (value, data) {
  if(_.isString(value)) {
    // if this doesn't solely contain a template value (e.g. '<%= key %>'), then
    // process it as a template to handle interpolated strings (e.g. 'hi <%= key %>).
    if(!expander.findProperty(value)) {
      return _.template(value, data);
    } else {
      return expander.stringExpand(value, data);
    }
  } else if(_.isArray(value)) {
    return expander.arrayExpand(value, data);
  } else if(_.isObject(value)) {
    return expander.objectExpand(value, data);
  } else {
    return value;
  }
};

// expand a key as referenced by a dot-notated string
expander.get = function(value, data) {
  return expander.expand(dotty.get(data, value), data);
};
