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
expander.tmplRegExp = new RegExp('<%=\\s*([a-z0-9_$]+(?:\\.[a-z0-9_$]+)*)\\s*%>$','i');

// inspect string for lookups that satisfy the above regexp
expander.findProperty = function (lookup) {
  var matches = expander.tmplRegExp.exec(lookup);
  if(matches) {
    return matches;
  } else {
    return false;
  }
};

// recursively expand a string until it doesn't contain any template strings
expander.stringExpand = function (data, lookup) {
  var property;
  // as long as this contains a template string, keep traversing
  while(property = expander.findProperty(lookup)) {
    // if this doesn't solely contain a template lookup (e.g. '<%= key %>'), then
    // recursively process it as a template to handle interpolated strings (e.g. 'hi <%= key %>).
    if(property[0] !== lookup) {
      lookup = _.template(lookup, data);
    } else {
      // expand to the literal value of this key
      lookup = expander.process(data, dotty.get(data, property[1]));
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

// expand any type of legal lookup
expander.process = function (data, lookup) {
  if(_.isString(lookup)) {
    return expander.stringExpand(data, lookup);
  } else if(_.isArray(lookup)) {
    return expander.arrayExpand(data, lookup);
  } else if(_.isPlainObject(lookup)) {
    return expander.objectExpand(data, lookup);
  } else {
    return lookup;
  }
};

// get the literal lookup of a key as referenced by a dot-notated string
expander.getRaw = function (data, lookup) {
  if(!lookup) {
    return data;
  } else {
    return dotty.get(data, lookup);
  }
};

// expand a key as referenced by a dot-notated string
expander.get = function(data, lookup) {
  if (!lookup) {
    return expander.objectExpand(data, data);
  } else {
    return expander.process(data, dotty.get(data, lookup));
  }
};
