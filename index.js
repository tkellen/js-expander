const _ = require('lodash');
const getobject = require('getobject');
const EventEmitter = require('events').EventEmitter;

// exported object
var expander = module.exports = {};

// match these: <%= foo %> and <%= foo.bar %>
// but not these: <%= foo() %> or <%= foo.bar() %>
var tmplRegExp = /\s*(?:\${\s*([a-z0-9_]+(?:\.[a-z0-9_]+)*)\s*}|<%=\s*([a-z0-9_]+(?:\.[a-z0-9_]+)*)\s*%>)\s*/i;

// inspect string for lookups that satisfy the above regexp
var findProperty = function (lookup) {
  var matches = tmplRegExp.exec(lookup);
  if(matches) {
    return {
      src: matches && matches[0],
      prop: matches && matches[1] || matches[2],
    };
  } else {
    return false;
  }
};

// recursively expand a string until it doesn't contain any template strings
var stringExpand = function (data, lookup) {
  var property;
  // as long as this contains a template string, keep traversing
  while(property = findProperty(lookup)) {
    // if this doesn't solely contain a template lookup (e.g. '<%= key %>'), then
    // recursively process it as a template to handle interpolated strings (e.g. 'hi <%= key %>).
    if(property.src !== lookup) {
      lookup = _.template(lookup, data);
    } else {
      // expand to the literal value of this key
      lookup = expander.process(data, getobject.get(data, property.prop));
    }
  }
  return lookup;
};

// recursively expand an array until it doesn't contain any template strings
var arrayExpand = function (data, arr) {
  return arr.map(function(lookup) {
    return expander.process(data, lookup);
  });
};

// recursively expand an object, resolving its template strings
var objectExpand = function (data, obj) {
  var result = {};
  Object.keys(obj).forEach(function(key) {
    result[key] = expander.process(data, obj[key]);
  });
  return result;
};

// set a heuristic indicating the method should be expanded
expander.fn = function (method) {
  method.__expanderFn__ = true;
  return method;
};

// expand any type of legal lookup
expander.process = function (data, lookup) {
  if(_.isFunction(lookup) && lookup.__expanderFn__ === true) {
    return lookup.call(this, data);
  } else if(_.isString(lookup)) {
    return stringExpand(data, lookup);
  } else if(_.isArray(lookup)) {
    return arrayExpand(data, lookup);
  } else if(_.isPlainObject(lookup)) {
    return objectExpand(data, lookup);
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
expander.get = function (data, lookup) {
  if (!lookup) {
    return objectExpand(data, data);
  } else {
    return expander.process(data, getobject.get(data, lookup));
  }
};

// set the value of a key as referenced by a dot-notated string
expander.set = function (data, lookup, value) {
  return getobject.set(data, lookup, value);
};

expander.walk = function (config, lookup, key) {
  var path = [];
  var nodes = lookup.split('.');
  var merges = [config.get(key)];
  nodes.forEach(function (node) {
    path.push(node);
    merges.push(config.get(path.concat(key).join('.')));
  });
  return _.merge.apply(null, merges);
};

// provide a getter/setter interface for expander
// this is so ugly.
expander.interface = function (data) {
  var emitter = new EventEmitter();
  var API = function (prop, value) {
    if (arguments.length === 2) {
      emitter.emit('set', prop, value);
      return getobject.set(data, prop, value);
    } else {
      return expander.get(data, prop);
    }
  };
  API.set = function (prop, value) {
    return API(prop, value);
  };
  API.on = emitter.on.bind(emitter);
  ['get', 'getRaw', 'process'].forEach(function (method) {
    API[method] = expander[method].bind(null, data);
  });
  return API;
};
