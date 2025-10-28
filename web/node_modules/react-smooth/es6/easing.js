function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
import { warn } from './util';
var ACCURACY = 1e-4;
var cubicBezierFactor = function cubicBezierFactor(c1, c2) {
  return [0, 3 * c1, 3 * c2 - 6 * c1, 3 * c1 - 3 * c2 + 1];
};
var multyTime = function multyTime(params, t) {
  return params.map(function (param, i) {
    return param * Math.pow(t, i);
  }).reduce(function (pre, curr) {
    return pre + curr;
  });
};
var cubicBezier = function cubicBezier(c1, c2) {
  return function (t) {
    var params = cubicBezierFactor(c1, c2);
    return multyTime(params, t);
  };
};
var derivativeCubicBezier = function derivativeCubicBezier(c1, c2) {
  return function (t) {
    var params = cubicBezierFactor(c1, c2);
    var newParams = [].concat(_toConsumableArray(params.map(function (param, i) {
      return param * i;
    }).slice(1)), [0]);
    return multyTime(newParams, t);
  };
};

// calculate cubic-bezier using Newton's method
export var configBezier = function configBezier() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  var x1 = args[0],
    y1 = args[1],
    x2 = args[2],
    y2 = args[3];
  if (args.length === 1) {
    switch (args[0]) {
      case 'linear':
        x1 = 0.0;
        y1 = 0.0;
        x2 = 1.0;
        y2 = 1.0;
        break;
      case 'ease':
        x1 = 0.25;
        y1 = 0.1;
        x2 = 0.25;
        y2 = 1.0;
        break;
      case 'ease-in':
        x1 = 0.42;
        y1 = 0.0;
        x2 = 1.0;
        y2 = 1.0;
        break;
      case 'ease-out':
        x1 = 0.42;
        y1 = 0.0;
        x2 = 0.58;
        y2 = 1.0;
        break;
      case 'ease-in-out':
        x1 = 0.0;
        y1 = 0.0;
        x2 = 0.58;
        y2 = 1.0;
        break;
      default:
        {
          var easing = args[0].split('(');
          if (easing[0] === 'cubic-bezier' && easing[1].split(')')[0].split(',').length === 4) {
            var _easing$1$split$0$spl = easing[1].split(')')[0].split(',').map(function (x) {
              return parseFloat(x);
            });
            var _easing$1$split$0$spl2 = _slicedToArray(_easing$1$split$0$spl, 4);
            x1 = _easing$1$split$0$spl2[0];
            y1 = _easing$1$split$0$spl2[1];
            x2 = _easing$1$split$0$spl2[2];
            y2 = _easing$1$split$0$spl2[3];
          } else {
            warn(false, '[configBezier]: arguments should be one of ' + "oneOf 'linear', 'ease', 'ease-in', 'ease-out', " + "'ease-in-out','cubic-bezier(x1,y1,x2,y2)', instead received %s", args);
          }
        }
    }
  }
  warn([x1, x2, y1, y2].every(function (num) {
    return typeof num === 'number' && num >= 0 && num <= 1;
  }), '[configBezier]: arguments should be x1, y1, x2, y2 of [0, 1] instead received %s', args);
  var curveX = cubicBezier(x1, x2);
  var curveY = cubicBezier(y1, y2);
  var derCurveX = derivativeCubicBezier(x1, x2);
  var rangeValue = function rangeValue(value) {
    if (value > 1) {
      return 1;
    }
    if (value < 0) {
      return 0;
    }
    return value;
  };
  var bezier = function bezier(_t) {
    var t = _t > 1 ? 1 : _t;
    var x = t;
    for (var i = 0; i < 8; ++i) {
      var evalT = curveX(x) - t;
      var derVal = derCurveX(x);
      if (Math.abs(evalT - t) < ACCURACY || derVal < ACCURACY) {
        return curveY(x);
      }
      x = rangeValue(x - evalT / derVal);
    }
    return curveY(x);
  };
  bezier.isStepper = false;
  return bezier;
};
export var configSpring = function configSpring() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _config$stiff = config.stiff,
    stiff = _config$stiff === void 0 ? 100 : _config$stiff,
    _config$damping = config.damping,
    damping = _config$damping === void 0 ? 8 : _config$damping,
    _config$dt = config.dt,
    dt = _config$dt === void 0 ? 17 : _config$dt;
  var stepper = function stepper(currX, destX, currV) {
    var FSpring = -(currX - destX) * stiff;
    var FDamping = currV * damping;
    var newV = currV + (FSpring - FDamping) * dt / 1000;
    var newX = currV * dt / 1000 + currX;
    if (Math.abs(newX - destX) < ACCURACY && Math.abs(newV) < ACCURACY) {
      return [destX, 0];
    }
    return [newX, newV];
  };
  stepper.isStepper = true;
  stepper.dt = dt;
  return stepper;
};
export var configEasing = function configEasing() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  var easing = args[0];
  if (typeof easing === 'string') {
    switch (easing) {
      case 'ease':
      case 'ease-in-out':
      case 'ease-out':
      case 'ease-in':
      case 'linear':
        return configBezier(easing);
      case 'spring':
        return configSpring();
      default:
        if (easing.split('(')[0] === 'cubic-bezier') {
          return configBezier(easing);
        }
        warn(false, "[configEasing]: first argument should be one of 'ease', 'ease-in', " + "'ease-out', 'ease-in-out','cubic-bezier(x1,y1,x2,y2)', 'linear' and 'spring', instead  received %s", args);
    }
  }
  if (typeof easing === 'function') {
    return easing;
  }
  warn(false, '[configEasing]: first argument type should be function or string, instead received %s', args);
  return null;
};