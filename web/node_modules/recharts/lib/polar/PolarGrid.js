"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolarGrid = void 0;
var _react = _interopRequireDefault(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _PolarUtils = require("../util/PolarUtils");
var _ReactUtils = require("../util/ReactUtils");
var _excluded = ["cx", "cy", "innerRadius", "outerRadius", "gridType", "radialLines"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * @fileOverview Polar Grid
 */
var getPolygonPath = function getPolygonPath(radius, cx, cy, polarAngles) {
  var path = '';
  polarAngles.forEach(function (angle, i) {
    var point = (0, _PolarUtils.polarToCartesian)(cx, cy, radius, angle);
    if (i) {
      path += "L ".concat(point.x, ",").concat(point.y);
    } else {
      path += "M ".concat(point.x, ",").concat(point.y);
    }
  });
  path += 'Z';
  return path;
};

// Draw axis of radial line
var PolarAngles = function PolarAngles(props) {
  var cx = props.cx,
    cy = props.cy,
    innerRadius = props.innerRadius,
    outerRadius = props.outerRadius,
    polarAngles = props.polarAngles,
    radialLines = props.radialLines;
  if (!polarAngles || !polarAngles.length || !radialLines) {
    return null;
  }
  var polarAnglesProps = _objectSpread({
    stroke: '#ccc'
  }, (0, _ReactUtils.filterProps)(props, false));
  return /*#__PURE__*/_react["default"].createElement("g", {
    className: "recharts-polar-grid-angle"
  }, polarAngles.map(function (entry) {
    var start = (0, _PolarUtils.polarToCartesian)(cx, cy, innerRadius, entry);
    var end = (0, _PolarUtils.polarToCartesian)(cx, cy, outerRadius, entry);
    return /*#__PURE__*/_react["default"].createElement("line", _extends({}, polarAnglesProps, {
      key: "line-".concat(entry),
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y
    }));
  }));
};

// Draw concentric circles
var ConcentricCircle = function ConcentricCircle(props) {
  var cx = props.cx,
    cy = props.cy,
    radius = props.radius,
    index = props.index;
  var concentricCircleProps = _objectSpread(_objectSpread({
    stroke: '#ccc'
  }, (0, _ReactUtils.filterProps)(props, false)), {}, {
    fill: 'none'
  });
  return /*#__PURE__*/_react["default"].createElement("circle", _extends({}, concentricCircleProps, {
    className: (0, _clsx["default"])('recharts-polar-grid-concentric-circle', props.className),
    key: "circle-".concat(index),
    cx: cx,
    cy: cy,
    r: radius
  }));
};

// Draw concentric polygons
var ConcentricPolygon = function ConcentricPolygon(props) {
  var radius = props.radius,
    index = props.index;
  var concentricPolygonProps = _objectSpread(_objectSpread({
    stroke: '#ccc'
  }, (0, _ReactUtils.filterProps)(props, false)), {}, {
    fill: 'none'
  });
  return /*#__PURE__*/_react["default"].createElement("path", _extends({}, concentricPolygonProps, {
    className: (0, _clsx["default"])('recharts-polar-grid-concentric-polygon', props.className),
    key: "path-".concat(index),
    d: getPolygonPath(radius, props.cx, props.cy, props.polarAngles)
  }));
};

// Draw concentric axis
// TODO Optimize the name
var ConcentricPath = function ConcentricPath(props) {
  var polarRadius = props.polarRadius,
    gridType = props.gridType;
  if (!polarRadius || !polarRadius.length) {
    return null;
  }
  return /*#__PURE__*/_react["default"].createElement("g", {
    className: "recharts-polar-grid-concentric"
  }, polarRadius.map(function (entry, i) {
    var key = i;
    if (gridType === 'circle') return /*#__PURE__*/_react["default"].createElement(ConcentricCircle, _extends({
      key: key
    }, props, {
      radius: entry,
      index: i
    }));
    return /*#__PURE__*/_react["default"].createElement(ConcentricPolygon, _extends({
      key: key
    }, props, {
      radius: entry,
      index: i
    }));
  }));
};
var PolarGrid = exports.PolarGrid = function PolarGrid(_ref) {
  var _ref$cx = _ref.cx,
    cx = _ref$cx === void 0 ? 0 : _ref$cx,
    _ref$cy = _ref.cy,
    cy = _ref$cy === void 0 ? 0 : _ref$cy,
    _ref$innerRadius = _ref.innerRadius,
    innerRadius = _ref$innerRadius === void 0 ? 0 : _ref$innerRadius,
    _ref$outerRadius = _ref.outerRadius,
    outerRadius = _ref$outerRadius === void 0 ? 0 : _ref$outerRadius,
    _ref$gridType = _ref.gridType,
    gridType = _ref$gridType === void 0 ? 'polygon' : _ref$gridType,
    _ref$radialLines = _ref.radialLines,
    radialLines = _ref$radialLines === void 0 ? true : _ref$radialLines,
    props = _objectWithoutProperties(_ref, _excluded);
  if (outerRadius <= 0) {
    return null;
  }
  return /*#__PURE__*/_react["default"].createElement("g", {
    className: "recharts-polar-grid"
  }, /*#__PURE__*/_react["default"].createElement(PolarAngles, _extends({
    cx: cx,
    cy: cy,
    innerRadius: innerRadius,
    outerRadius: outerRadius,
    gridType: gridType,
    radialLines: radialLines
  }, props)), /*#__PURE__*/_react["default"].createElement(ConcentricPath, _extends({
    cx: cx,
    cy: cy,
    innerRadius: innerRadius,
    outerRadius: outerRadius,
    gridType: gridType,
    radialLines: radialLines
  }, props)));
};
PolarGrid.displayName = 'PolarGrid';