"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _util = require("./util");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var alpha = function alpha(begin, end, k) {
  return begin + (end - begin) * k;
};
var needContinue = function needContinue(_ref) {
  var from = _ref.from,
    to = _ref.to;
  return from !== to;
};

/*
 * @description: cal new from value and velocity in each stepper
 * @return: { [styleProperty]: { from, to, velocity } }
 */
var calStepperVals = function calStepperVals(easing, preVals, steps) {
  var nextStepVals = (0, _util.mapObject)(function (key, val) {
    if (needContinue(val)) {
      var _easing = easing(val.from, val.to, val.velocity),
        _easing2 = _slicedToArray(_easing, 2),
        newX = _easing2[0],
        newV = _easing2[1];
      return _objectSpread(_objectSpread({}, val), {}, {
        from: newX,
        velocity: newV
      });
    }
    return val;
  }, preVals);
  if (steps < 1) {
    return (0, _util.mapObject)(function (key, val) {
      if (needContinue(val)) {
        return _objectSpread(_objectSpread({}, val), {}, {
          velocity: alpha(val.velocity, nextStepVals[key].velocity, steps),
          from: alpha(val.from, nextStepVals[key].from, steps)
        });
      }
      return val;
    }, preVals);
  }
  return calStepperVals(easing, nextStepVals, steps - 1);
};

// configure update function
var _default = exports.default = function _default(from, to, easing, duration, render) {
  var interKeys = (0, _util.getIntersectionKeys)(from, to);
  var timingStyle = interKeys.reduce(function (res, key) {
    return _objectSpread(_objectSpread({}, res), {}, _defineProperty({}, key, [from[key], to[key]]));
  }, {});
  var stepperStyle = interKeys.reduce(function (res, key) {
    return _objectSpread(_objectSpread({}, res), {}, _defineProperty({}, key, {
      from: from[key],
      velocity: 0,
      to: to[key]
    }));
  }, {});
  var cafId = -1;
  var preTime;
  var beginTime;
  var update = function update() {
    return null;
  };
  var getCurrStyle = function getCurrStyle() {
    return (0, _util.mapObject)(function (key, val) {
      return val.from;
    }, stepperStyle);
  };
  var shouldStopAnimation = function shouldStopAnimation() {
    return !Object.values(stepperStyle).filter(needContinue).length;
  };

  // stepper timing function like spring
  var stepperUpdate = function stepperUpdate(now) {
    if (!preTime) {
      preTime = now;
    }
    var deltaTime = now - preTime;
    var steps = deltaTime / easing.dt;
    stepperStyle = calStepperVals(easing, stepperStyle, steps);
    // get union set and add compatible prefix
    render(_objectSpread(_objectSpread(_objectSpread({}, from), to), getCurrStyle(stepperStyle)));
    preTime = now;
    if (!shouldStopAnimation()) {
      cafId = requestAnimationFrame(update);
    }
  };

  // t => val timing function like cubic-bezier
  var timingUpdate = function timingUpdate(now) {
    if (!beginTime) {
      beginTime = now;
    }
    var t = (now - beginTime) / duration;
    var currStyle = (0, _util.mapObject)(function (key, val) {
      return alpha.apply(void 0, _toConsumableArray(val).concat([easing(t)]));
    }, timingStyle);

    // get union set and add compatible prefix
    render(_objectSpread(_objectSpread(_objectSpread({}, from), to), currStyle));
    if (t < 1) {
      cafId = requestAnimationFrame(update);
    } else {
      var finalStyle = (0, _util.mapObject)(function (key, val) {
        return alpha.apply(void 0, _toConsumableArray(val).concat([easing(1)]));
      }, timingStyle);
      render(_objectSpread(_objectSpread(_objectSpread({}, from), to), finalStyle));
    }
  };
  update = easing.isStepper ? stepperUpdate : timingUpdate;

  // return start animation method
  return function () {
    requestAnimationFrame(update);

    // return stop animation method
    return function () {
      cancelAnimationFrame(cafId);
    };
  };
};