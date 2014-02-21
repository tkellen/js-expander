const _ = require('lodash');
const getobject = require('getobject');
const EventEmitter = require('events').EventEmitter;

// exported object
var expander = module.exports = {};

// match these: <%= foo %> and <%= foo.bar %>
// but not these: <%= foo() %> or <%= foo.bar() %>
// todo -- support method calls here to remove the
var tmplRegExp = /\s*(?:\${\s*([a-z0-9_]+(?:\.[a-z0-9_]+)*)\s*}|<%=\s*([a-z0-9_]+(?:\.[a-z0-9_]+)*)\s*%>)\s*/i;

// inspect string for lookups that satisfy the above regexp
var findProperty = function (lookup) {
  var matches = tmplRegExp.exec(lookup);
  if (matches) {
    return {
      src: matches && matches[0],
      prop: matches && matches[1] || matches[2],
    };
  } else {
    return false;
  }
};

var hasTemplate = function (lookup) {
  return (_.isString(lookup) &&
          (lookup.indexOf('<%=') !== -1 ||
           lookup.indexOf('${') !== -1));
};

// recursively expand a string until it doesn't contain any template strings
var stringExpand = function (data, lookup, options) {
  var property;
  // as long as this contains a template string, keep traversing
  while(property = findProperty(lookup)) {
    // if this doesn't solely contain a template lookup (e.g. '<%= key %>'), then
    // recursively process it as a template to handle interpolated strings (e.g. 'hi <%= key %>).
    if (property.src !== lookup) {
      lookup = _.template(lookup, data, options);
    } else {
      // expand to the literal value of this key
      lookup = expander.process(data, getobject.get(data, property.prop), options);
    }
  }
  // do one final check for templates.
  if (hasTemplate(lookup)) {
    lookup = _.template(lookup, data, options);
  }
  return lookup;
};

// recursively expand an array until it doesn't contain any template strings
var arrayExpand = function (data, arr, options) {
  return arr.map(function(lookup) {
    return expander.process(data, lookup, options);
  });
};

// recursively expand an object, resolving its template strings
var objectExpand = function (data, obj, options) {
  var result = {};
  Object.keys(obj).forEach(function(key) {
    result[key] = expander.process(data, obj[key], options);
  });
  return result;
};

// set a heuristic indicating the method should be expanded
expander.fn = function (method) {
  method.__expanderFn__ = true;
  return method;
};

// expand any type of legal lookup
expander.process = function (data, lookup, options) {
  if (_.isFunction(lookup) && lookup.__expanderFn__ === true) {
    return lookup.call(this, data);
  } else if (_.isString(lookup)) {
    return stringExpand(data, lookup, options);
  } else if (_.isArray(lookup)) {
    return arrayExpand(data, lookup, options);
  } else if (_.isPlainObject(lookup)) {
    return objectExpand(data, lookup, options);
  } else {
    return lookup;
  }
};

// get the literal value of a key as referenced by a dot-notated string
expander.getRaw = function (data, lookup) {
  if (!lookup) {
    return data;
  } else {
    return getobject.get(data, lookup);
  }
};

// get the expanded value of a key as referenced by a dot-notated string
expander.get = function (data, lookup, options) {
  if (!lookup) {
    return objectExpand(data, data, options);
  } else {
    return expander.process(data, getobject.get(data, lookup), options);
  }
};

// set the value of a key as referenced by a dot-notated string
expander.set = function (data, lookup, value) {
  return getobject.set(data, lookup, value);
};

// provide a getter/setter interface for expander
expander.interface = function (data, options) {
  var emitter = new EventEmitter();
  options = options||{};
  var API = function (prop, value) {
    if (arguments.length === 2) {
      emitter.emit('set', prop, value);
      return getobject.set(data, prop, value);
    } else {
      return expander.get(data, prop, options);
    }
  };
  API.on = emitter.on.bind(emitter);
  API.getRaw = expander.getRaw.bind(null, data);
  API.get = function (prop, opts) {
    return expander.get(data, prop, _.extend({}, options, opts));
  };
  API.process = function (lookup, opts) {
    return expander.process(data, lookup, _.extend({}, options, opts));
  };
  API.set = function (prop, value) {
    return API(prop, value);
  };

  return API;
};
