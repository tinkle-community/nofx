"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPath = exports.Curve = void 0;
var React = _interopRequireWildcard(require("react"));
var _d3Shape = require("victory-vendor/d3-shape");
var _upperFirst = _interopRequireDefault(require("lodash/upperFirst"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _clsx = _interopRequireDefault(require("clsx"));
var _types = require("../util/types");
var _ReactUtils = require("../util/ReactUtils");
var _DataUtils = require("../util/DataUtils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * @fileOverview Curve
 */
var CURVE_FACTORIES = {
  curveBasisClosed: _d3Shape.curveBasisClosed,
  curveBasisOpen: _d3Shape.curveBasisOpen,
  curveBasis: _d3Shape.curveBasis,
  curveBumpX: _d3Shape.curveBumpX,
  curveBumpY: _d3Shape.curveBumpY,
  curveLinearClosed: _d3Shape.curveLinearClosed,
  curveLinear: _d3Shape.curveLinear,
  curveMonotoneX: _d3Shape.curveMonotoneX,
  curveMonotoneY: _d3Shape.curveMonotoneY,
  curveNatural: _d3Shape.curveNatural,
  curveStep: _d3Shape.curveStep,
  curveStepAfter: _d3Shape.curveStepAfter,
  curveStepBefore: _d3Shape.curveStepBefore
};
var defined = function defined(p) {
  return p.x === +p.x && p.y === +p.y;
};
var getX = function getX(p) {
  return p.x;
};
var getY = function getY(p) {
  return p.y;
};
var getCurveFactory = function getCurveFactory(type, layout) {
  if ((0, _isFunction["default"])(type)) {
    return type;
  }
  var name = "curve".concat((0, _upperFirst["default"])(type));
  if ((name === 'curveMonotone' || name === 'curveBump') && layout) {
    return CURVE_FACTORIES["".concat(name).concat(layout === 'vertical' ? 'Y' : 'X')];
  }
  return CURVE_FACTORIES[name] || _d3Shape.curveLinear;
};
/**
 * Calculate the path of curve. Returns null if points is an empty array.
 * @return path or null
 */
var getPath = exports.getPath = function getPath(_ref) {
  var _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'linear' : _ref$type,
    _ref$points = _ref.points,
    points = _ref$points === void 0 ? [] : _ref$points,
    baseLine = _ref.baseLine,
    layout = _ref.layout,
    _ref$connectNulls = _ref.connectNulls,
    connectNulls = _ref$connectNulls === void 0 ? false : _ref$connectNulls;
  var curveFactory = getCurveFactory(type, layout);
  var formatPoints = connectNulls ? points.filter(function (entry) {
    return defined(entry);
  }) : points;
  var lineFunction;
  if (Array.isArray(baseLine)) {
    var formatBaseLine = connectNulls ? baseLine.filter(function (base) {
      return defined(base);
    }) : baseLine;
    var areaPoints = formatPoints.map(function (entry, index) {
      return _objectSpread(_objectSpread({}, entry), {}, {
        base: formatBaseLine[index]
      });
    });
    if (layout === 'vertical') {
      lineFunction = (0, _d3Shape.area)().y(getY).x1(getX).x0(function (d) {
        return d.base.x;
      });
    } else {
      lineFunction = (0, _d3Shape.area)().x(getX).y1(getY).y0(function (d) {
        return d.base.y;
      });
    }
    lineFunction.defined(defined).curve(curveFactory);
    return lineFunction(areaPoints);
  }
  if (layout === 'vertical' && (0, _DataUtils.isNumber)(baseLine)) {
    lineFunction = (0, _d3Shape.area)().y(getY).x1(getX).x0(baseLine);
  } else if ((0, _DataUtils.isNumber)(baseLine)) {
    lineFunction = (0, _d3Shape.area)().x(getX).y1(getY).y0(baseLine);
  } else {
    lineFunction = (0, _d3Shape.line)().x(getX).y(getY);
  }
  lineFunction.defined(defined).curve(curveFactory);
  return lineFunction(formatPoints);
};
var Curve = exports.Curve = function Curve(props) {
  var className = props.className,
    points = props.points,
    path = props.path,
    pathRef = props.pathRef;
  if ((!points || !points.length) && !path) {
    return null;
  }
  var realPath = points && points.length ? getPath(props) : path;
  return /*#__PURE__*/React.createElement("path", _extends({}, (0, _ReactUtils.filterProps)(props, false), (0, _types.adaptEventHandlers)(props), {
    className: (0, _clsx["default"])('recharts-curve', className),
    d: realPath,
    ref: pathRef
  }));
};