"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.radianToDegree = exports.polarToCartesian = exports.inRangeOfSector = exports.getTickClassName = exports.getMaxRadius = exports.getAngleOfPoint = exports.formatAxisMap = exports.formatAngleOfSector = exports.distanceBetweenPoints = exports.degreeToRadian = exports.RADIAN = void 0;
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _react = require("react");
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _DataUtils = require("./DataUtils");
var _ChartUtils = require("./ChartUtils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var RADIAN = exports.RADIAN = Math.PI / 180;
var degreeToRadian = exports.degreeToRadian = function degreeToRadian(angle) {
  return angle * Math.PI / 180;
};
var radianToDegree = exports.radianToDegree = function radianToDegree(angleInRadian) {
  return angleInRadian * 180 / Math.PI;
};
var polarToCartesian = exports.polarToCartesian = function polarToCartesian(cx, cy, radius, angle) {
  return {
    x: cx + Math.cos(-RADIAN * angle) * radius,
    y: cy + Math.sin(-RADIAN * angle) * radius
  };
};
var getMaxRadius = exports.getMaxRadius = function getMaxRadius(width, height) {
  var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  return Math.min(Math.abs(width - (offset.left || 0) - (offset.right || 0)), Math.abs(height - (offset.top || 0) - (offset.bottom || 0))) / 2;
};

/**
 * Calculate the scale function, position, width, height of axes
 * @param  {Object} props     Latest props
 * @param  {Object} axisMap   The configuration of axes
 * @param  {Object} offset    The offset of main part in the svg element
 * @param  {Object} axisType  The type of axes, radius-axis or angle-axis
 * @param  {String} chartName The name of chart
 * @return {Object} Configuration
 */
var formatAxisMap = exports.formatAxisMap = function formatAxisMap(props, axisMap, offset, axisType, chartName) {
  var width = props.width,
    height = props.height;
  var startAngle = props.startAngle,
    endAngle = props.endAngle;
  var cx = (0, _DataUtils.getPercentValue)(props.cx, width, width / 2);
  var cy = (0, _DataUtils.getPercentValue)(props.cy, height, height / 2);
  var maxRadius = getMaxRadius(width, height, offset);
  var innerRadius = (0, _DataUtils.getPercentValue)(props.innerRadius, maxRadius, 0);
  var outerRadius = (0, _DataUtils.getPercentValue)(props.outerRadius, maxRadius, maxRadius * 0.8);
  var ids = Object.keys(axisMap);
  return ids.reduce(function (result, id) {
    var axis = axisMap[id];
    var domain = axis.domain,
      reversed = axis.reversed;
    var range;
    if ((0, _isNil["default"])(axis.range)) {
      if (axisType === 'angleAxis') {
        range = [startAngle, endAngle];
      } else if (axisType === 'radiusAxis') {
        range = [innerRadius, outerRadius];
      }
      if (reversed) {
        range = [range[1], range[0]];
      }
    } else {
      range = axis.range;
      var _range = range;
      var _range2 = _slicedToArray(_range, 2);
      startAngle = _range2[0];
      endAngle = _range2[1];
    }
    var _parseScale = (0, _ChartUtils.parseScale)(axis, chartName),
      realScaleType = _parseScale.realScaleType,
      scale = _parseScale.scale;
    scale.domain(domain).range(range);
    (0, _ChartUtils.checkDomainOfScale)(scale);
    var ticks = (0, _ChartUtils.getTicksOfScale)(scale, _objectSpread(_objectSpread({}, axis), {}, {
      realScaleType: realScaleType
    }));
    var finalAxis = _objectSpread(_objectSpread(_objectSpread({}, axis), ticks), {}, {
      range: range,
      radius: outerRadius,
      realScaleType: realScaleType,
      scale: scale,
      cx: cx,
      cy: cy,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: startAngle,
      endAngle: endAngle
    });
    return _objectSpread(_objectSpread({}, result), {}, _defineProperty({}, id, finalAxis));
  }, {});
};
var distanceBetweenPoints = exports.distanceBetweenPoints = function distanceBetweenPoints(point, anotherPoint) {
  var x1 = point.x,
    y1 = point.y;
  var x2 = anotherPoint.x,
    y2 = anotherPoint.y;
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};
var getAngleOfPoint = exports.getAngleOfPoint = function getAngleOfPoint(_ref, _ref2) {
  var x = _ref.x,
    y = _ref.y;
  var cx = _ref2.cx,
    cy = _ref2.cy;
  var radius = distanceBetweenPoints({
    x: x,
    y: y
  }, {
    x: cx,
    y: cy
  });
  if (radius <= 0) {
    return {
      radius: radius
    };
  }
  var cos = (x - cx) / radius;
  var angleInRadian = Math.acos(cos);
  if (y > cy) {
    angleInRadian = 2 * Math.PI - angleInRadian;
  }
  return {
    radius: radius,
    angle: radianToDegree(angleInRadian),
    angleInRadian: angleInRadian
  };
};
var formatAngleOfSector = exports.formatAngleOfSector = function formatAngleOfSector(_ref3) {
  var startAngle = _ref3.startAngle,
    endAngle = _ref3.endAngle;
  var startCnt = Math.floor(startAngle / 360);
  var endCnt = Math.floor(endAngle / 360);
  var min = Math.min(startCnt, endCnt);
  return {
    startAngle: startAngle - min * 360,
    endAngle: endAngle - min * 360
  };
};
var reverseFormatAngleOfSetor = function reverseFormatAngleOfSetor(angle, _ref4) {
  var startAngle = _ref4.startAngle,
    endAngle = _ref4.endAngle;
  var startCnt = Math.floor(startAngle / 360);
  var endCnt = Math.floor(endAngle / 360);
  var min = Math.min(startCnt, endCnt);
  return angle + min * 360;
};
var inRangeOfSector = exports.inRangeOfSector = function inRangeOfSector(_ref5, sector) {
  var x = _ref5.x,
    y = _ref5.y;
  var _getAngleOfPoint = getAngleOfPoint({
      x: x,
      y: y
    }, sector),
    radius = _getAngleOfPoint.radius,
    angle = _getAngleOfPoint.angle;
  var innerRadius = sector.innerRadius,
    outerRadius = sector.outerRadius;
  if (radius < innerRadius || radius > outerRadius) {
    return false;
  }
  if (radius === 0) {
    return true;
  }
  var _formatAngleOfSector = formatAngleOfSector(sector),
    startAngle = _formatAngleOfSector.startAngle,
    endAngle = _formatAngleOfSector.endAngle;
  var formatAngle = angle;
  var inRange;
  if (startAngle <= endAngle) {
    while (formatAngle > endAngle) {
      formatAngle -= 360;
    }
    while (formatAngle < startAngle) {
      formatAngle += 360;
    }
    inRange = formatAngle >= startAngle && formatAngle <= endAngle;
  } else {
    while (formatAngle > startAngle) {
      formatAngle -= 360;
    }
    while (formatAngle < endAngle) {
      formatAngle += 360;
    }
    inRange = formatAngle >= endAngle && formatAngle <= startAngle;
  }
  if (inRange) {
    return _objectSpread(_objectSpread({}, sector), {}, {
      radius: radius,
      angle: reverseFormatAngleOfSetor(formatAngle, sector)
    });
  }
  return null;
};
var getTickClassName = exports.getTickClassName = function getTickClassName(tick) {
  return ! /*#__PURE__*/(0, _react.isValidElement)(tick) && !(0, _isFunction["default"])(tick) && typeof tick !== 'boolean' ? tick.className : '';
};