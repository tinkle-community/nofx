function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var identity = function identity(i) {
  return i;
};

export var PLACE_HOLDER = {
  '@@functional/placeholder': true
};

var isPlaceHolder = function isPlaceHolder(val) {
  return val === PLACE_HOLDER;
};

var curry0 = function curry0(fn) {
  return function _curried() {
    if (arguments.length === 0 || arguments.length === 1 && isPlaceHolder(arguments.length <= 0 ? undefined : arguments[0])) {
      return _curried;
    }

    return fn.apply(void 0, arguments);
  };
};

var curryN = function curryN(n, fn) {
  if (n === 1) {
    return fn;
  }

  return curry0(function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var argsLength = args.filter(function (arg) {
      return arg !== PLACE_HOLDER;
    }).length;

    if (argsLength >= n) {
      return fn.apply(void 0, args);
    }

    return curryN(n - argsLength, curry0(function () {
      for (var _len2 = arguments.length, restArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        restArgs[_key2] = arguments[_key2];
      }

      var newArgs = args.map(function (arg) {
        return isPlaceHolder(arg) ? restArgs.shift() : arg;
      });
      return fn.apply(void 0, _toConsumableArray(newArgs).concat(restArgs));
    }));
  });
};

export var curry = function curry(fn) {
  return curryN(fn.length, fn);
};
export var range = function range(begin, end) {
  var arr = [];

  for (var i = begin; i < end; ++i) {
    arr[i - begin] = i;
  }

  return arr;
};
export var map = curry(function (fn, arr) {
  if (Array.isArray(arr)) {
    return arr.map(fn);
  }

  return Object.keys(arr).map(function (key) {
    return arr[key];
  }).map(fn);
});
export var compose = function compose() {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  if (!args.length) {
    return identity;
  }

  var fns = args.reverse(); // first function can receive multiply arguments

  var firstFn = fns[0];
  var tailsFn = fns.slice(1);
  return function () {
    return tailsFn.reduce(function (res, fn) {
      return fn(res);
    }, firstFn.apply(void 0, arguments));
  };
};
export var reverse = function reverse(arr) {
  if (Array.isArray(arr)) {
    return arr.reverse();
  } // can be string


  return arr.split('').reverse.join('');
};
export var memoize = function memoize(fn) {
  var lastArgs = null;
  var lastResult = null;
  return function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    if (lastArgs && args.every(function (val, i) {
      return val === lastArgs[i];
    })) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = fn.apply(void 0, args);
    return lastResult;
  };
};