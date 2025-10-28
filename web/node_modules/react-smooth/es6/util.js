function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/* eslint no-console: 0 */

export var getIntersectionKeys = function getIntersectionKeys(preObj, nextObj) {
  return [Object.keys(preObj), Object.keys(nextObj)].reduce(function (a, b) {
    return a.filter(function (c) {
      return b.includes(c);
    });
  });
};
export var identity = function identity(param) {
  return param;
};

/*
 * @description: convert camel case to dash case
 * string => string
 */
export var getDashCase = function getDashCase(name) {
  return name.replace(/([A-Z])/g, function (v) {
    return "-".concat(v.toLowerCase());
  });
};
export var log = function log() {
  var _console;
  (_console = console).log.apply(_console, arguments);
};

/*
 * @description: log the value of a varible
 * string => any => any
 */
export var debug = function debug(name) {
  return function (item) {
    log(name, item);
    return item;
  };
};

/*
 * @description: log name, args, return value of a function
 * function => function
 */
export var debugf = function debugf(tag, f) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var res = f.apply(void 0, args);
    var name = tag || f.name || 'anonymous function';
    var argNames = "(".concat(args.map(JSON.stringify).join(', '), ")");
    log("".concat(name, ": ").concat(argNames, " => ").concat(JSON.stringify(res)));
    return res;
  };
};

/*
 * @description: map object on every element in this object.
 * (function, object) => object
 */
export var mapObject = function mapObject(fn, obj) {
  return Object.keys(obj).reduce(function (res, key) {
    return _objectSpread(_objectSpread({}, res), {}, _defineProperty({}, key, fn(key, obj[key])));
  }, {});
};
export var getTransitionVal = function getTransitionVal(props, duration, easing) {
  return props.map(function (prop) {
    return "".concat(getDashCase(prop), " ").concat(duration, "ms ").concat(easing);
  }).join(',');
};
var isDev = process.env.NODE_ENV !== 'production';
export var warn = function warn(condition, format, a, b, c, d, e, f) {
  if (isDev && typeof console !== 'undefined' && console.warn) {
    if (format === undefined) {
      console.warn('LogUtils requires an error message argument');
    }
    if (!condition) {
      if (format === undefined) {
        console.warn('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
      } else {
        var args = [a, b, c, d, e, f];
        var argIndex = 0;
        console.warn(format.replace(/%s/g, function () {
          return args[argIndex++];
        }));
      }
    }
  }
};