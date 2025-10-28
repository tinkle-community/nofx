function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import mapValues from 'lodash/mapValues';
import every from 'lodash/every';
import { getTicksOfScale, parseScale, checkDomainOfScale, getBandSizeOfAxis } from './ChartUtils';
import { findChildByType } from './ReactUtils';
import { compareValues, getPercentValue } from './DataUtils';
import { Bar } from '../cartesian/Bar';

/**
 * Calculate the scale function, position, width, height of axes
 * @param  {Object} props     Latest props
 * @param  {Object} axisMap   The configuration of axes
 * @param  {Object} offset    The offset of main part in the svg element
 * @param  {String} axisType  The type of axes, x-axis or y-axis
 * @param  {String} chartName The name of chart
 * @return {Object} Configuration
 */
export var formatAxisMap = function formatAxisMap(props, axisMap, offset, axisType, chartName) {
  var width = props.width,
    height = props.height,
    layout = props.layout,
    children = props.children;
  var ids = Object.keys(axisMap);
  var steps = {
    left: offset.left,
    leftMirror: offset.left,
    right: width - offset.right,
    rightMirror: width - offset.right,
    top: offset.top,
    topMirror: offset.top,
    bottom: height - offset.bottom,
    bottomMirror: height - offset.bottom
  };
  var hasBar = !!findChildByType(children, Bar);
  return ids.reduce(function (result, id) {
    var axis = axisMap[id];
    var orientation = axis.orientation,
      domain = axis.domain,
      _axis$padding = axis.padding,
      padding = _axis$padding === void 0 ? {} : _axis$padding,
      mirror = axis.mirror,
      reversed = axis.reversed;
    var offsetKey = "".concat(orientation).concat(mirror ? 'Mirror' : '');
    var calculatedPadding, range, x, y, needSpace;
    if (axis.type === 'number' && (axis.padding === 'gap' || axis.padding === 'no-gap')) {
      var diff = domain[1] - domain[0];
      var smallestDistanceBetweenValues = Infinity;
      var sortedValues = axis.categoricalDomain.sort(compareValues);
      sortedValues.forEach(function (value, index) {
        if (index > 0) {
          smallestDistanceBetweenValues = Math.min((value || 0) - (sortedValues[index - 1] || 0), smallestDistanceBetweenValues);
        }
      });
      if (Number.isFinite(smallestDistanceBetweenValues)) {
        var smallestDistanceInPercent = smallestDistanceBetweenValues / diff;
        var rangeWidth = axis.layout === 'vertical' ? offset.height : offset.width;
        if (axis.padding === 'gap') {
          calculatedPadding = smallestDistanceInPercent * rangeWidth / 2;
        }
        if (axis.padding === 'no-gap') {
          var gap = getPercentValue(props.barCategoryGap, smallestDistanceInPercent * rangeWidth);
          var halfBand = smallestDistanceInPercent * rangeWidth / 2;
          calculatedPadding = halfBand - gap - (halfBand - gap) / rangeWidth * gap;
        }
      }
    }
    if (axisType === 'xAxis') {
      range = [offset.left + (padding.left || 0) + (calculatedPadding || 0), offset.left + offset.width - (padding.right || 0) - (calculatedPadding || 0)];
    } else if (axisType === 'yAxis') {
      range = layout === 'horizontal' ? [offset.top + offset.height - (padding.bottom || 0), offset.top + (padding.top || 0)] : [offset.top + (padding.top || 0) + (calculatedPadding || 0), offset.top + offset.height - (padding.bottom || 0) - (calculatedPadding || 0)];
    } else {
      range = axis.range;
    }
    if (reversed) {
      range = [range[1], range[0]];
    }
    var _parseScale = parseScale(axis, chartName, hasBar),
      scale = _parseScale.scale,
      realScaleType = _parseScale.realScaleType;
    scale.domain(domain).range(range);
    checkDomainOfScale(scale);
    var ticks = getTicksOfScale(scale, _objectSpread(_objectSpread({}, axis), {}, {
      realScaleType: realScaleType
    }));
    if (axisType === 'xAxis') {
      needSpace = orientation === 'top' && !mirror || orientation === 'bottom' && mirror;
      x = offset.left;
      y = steps[offsetKey] - needSpace * axis.height;
    } else if (axisType === 'yAxis') {
      needSpace = orientation === 'left' && !mirror || orientation === 'right' && mirror;
      x = steps[offsetKey] - needSpace * axis.width;
      y = offset.top;
    }
    var finalAxis = _objectSpread(_objectSpread(_objectSpread({}, axis), ticks), {}, {
      realScaleType: realScaleType,
      x: x,
      y: y,
      scale: scale,
      width: axisType === 'xAxis' ? offset.width : axis.width,
      height: axisType === 'yAxis' ? offset.height : axis.height
    });
    finalAxis.bandSize = getBandSizeOfAxis(finalAxis, ticks);
    if (!axis.hide && axisType === 'xAxis') {
      steps[offsetKey] += (needSpace ? -1 : 1) * finalAxis.height;
    } else if (!axis.hide) {
      steps[offsetKey] += (needSpace ? -1 : 1) * finalAxis.width;
    }
    return _objectSpread(_objectSpread({}, result), {}, _defineProperty({}, id, finalAxis));
  }, {});
};
export var rectWithPoints = function rectWithPoints(_ref, _ref2) {
  var x1 = _ref.x,
    y1 = _ref.y;
  var x2 = _ref2.x,
    y2 = _ref2.y;
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1)
  };
};

/**
 * Compute the x, y, width, and height of a box from two reference points.
 * @param  {Object} coords     x1, x2, y1, and y2
 * @return {Object} object
 */
export var rectWithCoords = function rectWithCoords(_ref3) {
  var x1 = _ref3.x1,
    y1 = _ref3.y1,
    x2 = _ref3.x2,
    y2 = _ref3.y2;
  return rectWithPoints({
    x: x1,
    y: y1
  }, {
    x: x2,
    y: y2
  });
};
export var ScaleHelper = /*#__PURE__*/function () {
  function ScaleHelper(scale) {
    _classCallCheck(this, ScaleHelper);
    this.scale = scale;
  }
  return _createClass(ScaleHelper, [{
    key: "domain",
    get: function get() {
      return this.scale.domain;
    }
  }, {
    key: "range",
    get: function get() {
      return this.scale.range;
    }
  }, {
    key: "rangeMin",
    get: function get() {
      return this.range()[0];
    }
  }, {
    key: "rangeMax",
    get: function get() {
      return this.range()[1];
    }
  }, {
    key: "bandwidth",
    get: function get() {
      return this.scale.bandwidth;
    }
  }, {
    key: "apply",
    value: function apply(value) {
      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        bandAware = _ref4.bandAware,
        position = _ref4.position;
      if (value === undefined) {
        return undefined;
      }
      if (position) {
        switch (position) {
          case 'start':
            {
              return this.scale(value);
            }
          case 'middle':
            {
              var offset = this.bandwidth ? this.bandwidth() / 2 : 0;
              return this.scale(value) + offset;
            }
          case 'end':
            {
              var _offset = this.bandwidth ? this.bandwidth() : 0;
              return this.scale(value) + _offset;
            }
          default:
            {
              return this.scale(value);
            }
        }
      }
      if (bandAware) {
        var _offset2 = this.bandwidth ? this.bandwidth() / 2 : 0;
        return this.scale(value) + _offset2;
      }
      return this.scale(value);
    }
  }, {
    key: "isInRange",
    value: function isInRange(value) {
      var range = this.range();
      var first = range[0];
      var last = range[range.length - 1];
      return first <= last ? value >= first && value <= last : value >= last && value <= first;
    }
  }], [{
    key: "create",
    value: function create(obj) {
      return new ScaleHelper(obj);
    }
  }]);
}();
_defineProperty(ScaleHelper, "EPS", 1e-4);
export var createLabeledScales = function createLabeledScales(options) {
  var scales = Object.keys(options).reduce(function (res, key) {
    return _objectSpread(_objectSpread({}, res), {}, _defineProperty({}, key, ScaleHelper.create(options[key])));
  }, {});
  return _objectSpread(_objectSpread({}, scales), {}, {
    apply: function apply(coord) {
      var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        bandAware = _ref5.bandAware,
        position = _ref5.position;
      return mapValues(coord, function (value, label) {
        return scales[label].apply(value, {
          bandAware: bandAware,
          position: position
        });
      });
    },
    isInRange: function isInRange(coord) {
      return every(coord, function (value, label) {
        return scales[label].isInRange(value);
      });
    }
  });
};

/** Normalizes the angle so that 0 <= angle < 180.
 * @param {number} angle Angle in degrees.
 * @return {number} the normalized angle with a value of at least 0 and never greater or equal to 180. */
export function normalizeAngle(angle) {
  return (angle % 180 + 180) % 180;
}

/** Calculates the width of the largest horizontal line that fits inside a rectangle that is displayed at an angle.
 * @param {Object} size Width and height of the text in a horizontal position.
 * @param {number} angle Angle in degrees in which the text is displayed.
 * @return {number} The width of the largest horizontal line that fits inside a rectangle that is displayed at an angle.
 */
export var getAngledRectangleWidth = function getAngledRectangleWidth(_ref6) {
  var width = _ref6.width,
    height = _ref6.height;
  var angle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Ensure angle is >= 0 && < 180
  var normalizedAngle = normalizeAngle(angle);
  var angleRadians = normalizedAngle * Math.PI / 180;

  /* Depending on the height and width of the rectangle, we may need to use different formulas to calculate the angled
   * width. This threshold defines when each formula should kick in. */
  var angleThreshold = Math.atan(height / width);
  var angledWidth = angleRadians > angleThreshold && angleRadians < Math.PI - angleThreshold ? height / Math.sin(angleRadians) : width / Math.cos(angleRadians);
  return Math.abs(angledWidth);
};