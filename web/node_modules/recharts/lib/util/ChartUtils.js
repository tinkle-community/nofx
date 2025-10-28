"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCateCoordinateOfBar = exports.getBaseValueOfBar = exports.getBarSizeList = exports.getBarPosition = exports.getBandSizeOfAxis = exports.findPositionOfBar = exports.combineEventHandlers = exports.checkDomainOfScale = exports.calculateActiveTickIndex = exports.appendOffsetOfLegend = exports.MIN_VALUE_REG = exports.MAX_VALUE_REG = void 0;
exports.getCateCoordinateOfLine = getCateCoordinateOfLine;
exports.getCoordinatesOfGrid = void 0;
exports.getDomainOfDataByKey = getDomainOfDataByKey;
exports.getDomainOfStackGroups = exports.getDomainOfItemsWithSameAxis = exports.getDomainOfErrorBars = void 0;
Object.defineProperty(exports, "getLegendProps", {
  enumerable: true,
  get: function get() {
    return _getLegendProps.getLegendProps;
  }
});
exports.getTooltipItem = exports.getTicksOfScale = exports.getTicksOfAxis = exports.getStackedDataOfItem = exports.getStackedData = exports.getStackGroupsByAxisId = exports.getMainColorOfGraphicItem = void 0;
exports.getValueByDataKey = getValueByDataKey;
exports.truncateByDomain = exports.parseSpecifiedDomain = exports.parseScale = exports.parseErrorBarsOfAxis = exports.parseDomainOfCategoryAxis = exports.offsetSign = exports.offsetPositive = exports.isCategoricalAxis = void 0;
var d3Scales = _interopRequireWildcard(require("victory-vendor/d3-scale"));
var _d3Shape = require("victory-vendor/d3-shape");
var _max = _interopRequireDefault(require("lodash/max"));
var _min = _interopRequireDefault(require("lodash/min"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _isString = _interopRequireDefault(require("lodash/isString"));
var _get = _interopRequireDefault(require("lodash/get"));
var _flatMap = _interopRequireDefault(require("lodash/flatMap"));
var _isNaN = _interopRequireDefault(require("lodash/isNaN"));
var _upperFirst = _interopRequireDefault(require("lodash/upperFirst"));
var _isEqual = _interopRequireDefault(require("lodash/isEqual"));
var _sortBy = _interopRequireDefault(require("lodash/sortBy"));
var _rechartsScale = require("recharts-scale");
var _ErrorBar = require("../cartesian/ErrorBar");
var _DataUtils = require("./DataUtils");
var _ReactUtils = require("./ReactUtils");
var _getLegendProps = require("./getLegendProps");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } // TODO: Cause of circular dependency. Needs refactor.
// import { RadiusAxisProps, AngleAxisProps } from '../polar/types';
// Exported for backwards compatibility
function getValueByDataKey(obj, dataKey, defaultValue) {
  if ((0, _isNil["default"])(obj) || (0, _isNil["default"])(dataKey)) {
    return defaultValue;
  }
  if ((0, _DataUtils.isNumOrStr)(dataKey)) {
    return (0, _get["default"])(obj, dataKey, defaultValue);
  }
  if ((0, _isFunction["default"])(dataKey)) {
    return dataKey(obj);
  }
  return defaultValue;
}
/**
 * Get domain of data by key.
 * @param  {Array}   data      The data displayed in the chart
 * @param  {String}  key       The unique key of a group of data
 * @param  {String}  type      The type of axis
 * @param  {Boolean} filterNil Whether or not filter nil values
 * @return {Array} Domain of data
 */
function getDomainOfDataByKey(data, key, type, filterNil) {
  var flattenData = (0, _flatMap["default"])(data, function (entry) {
    return getValueByDataKey(entry, key);
  });
  if (type === 'number') {
    // @ts-expect-error parseFloat type only accepts strings
    var domain = flattenData.filter(function (entry) {
      return (0, _DataUtils.isNumber)(entry) || parseFloat(entry);
    });
    return domain.length ? [(0, _min["default"])(domain), (0, _max["default"])(domain)] : [Infinity, -Infinity];
  }
  var validateData = filterNil ? flattenData.filter(function (entry) {
    return !(0, _isNil["default"])(entry);
  }) : flattenData;

  // Supports x-axis of Date type
  return validateData.map(function (entry) {
    return (0, _DataUtils.isNumOrStr)(entry) || entry instanceof Date ? entry : '';
  });
}
var calculateActiveTickIndex = exports.calculateActiveTickIndex = function calculateActiveTickIndex(coordinate) {
  var _ticks$length;
  var ticks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var unsortedTicks = arguments.length > 2 ? arguments[2] : undefined;
  var axis = arguments.length > 3 ? arguments[3] : undefined;
  var index = -1;
  var len = (_ticks$length = ticks === null || ticks === void 0 ? void 0 : ticks.length) !== null && _ticks$length !== void 0 ? _ticks$length : 0;

  // if there are 1 or less ticks ticks then the active tick is at index 0
  if (len <= 1) {
    return 0;
  }
  if (axis && axis.axisType === 'angleAxis' && Math.abs(Math.abs(axis.range[1] - axis.range[0]) - 360) <= 1e-6) {
    var range = axis.range;
    // ticks are distributed in a circle
    for (var i = 0; i < len; i++) {
      var before = i > 0 ? unsortedTicks[i - 1].coordinate : unsortedTicks[len - 1].coordinate;
      var cur = unsortedTicks[i].coordinate;
      var after = i >= len - 1 ? unsortedTicks[0].coordinate : unsortedTicks[i + 1].coordinate;
      var sameDirectionCoord = void 0;
      if ((0, _DataUtils.mathSign)(cur - before) !== (0, _DataUtils.mathSign)(after - cur)) {
        var diffInterval = [];
        if ((0, _DataUtils.mathSign)(after - cur) === (0, _DataUtils.mathSign)(range[1] - range[0])) {
          sameDirectionCoord = after;
          var curInRange = cur + range[1] - range[0];
          diffInterval[0] = Math.min(curInRange, (curInRange + before) / 2);
          diffInterval[1] = Math.max(curInRange, (curInRange + before) / 2);
        } else {
          sameDirectionCoord = before;
          var afterInRange = after + range[1] - range[0];
          diffInterval[0] = Math.min(cur, (afterInRange + cur) / 2);
          diffInterval[1] = Math.max(cur, (afterInRange + cur) / 2);
        }
        var sameInterval = [Math.min(cur, (sameDirectionCoord + cur) / 2), Math.max(cur, (sameDirectionCoord + cur) / 2)];
        if (coordinate > sameInterval[0] && coordinate <= sameInterval[1] || coordinate >= diffInterval[0] && coordinate <= diffInterval[1]) {
          index = unsortedTicks[i].index;
          break;
        }
      } else {
        var minValue = Math.min(before, after);
        var maxValue = Math.max(before, after);
        if (coordinate > (minValue + cur) / 2 && coordinate <= (maxValue + cur) / 2) {
          index = unsortedTicks[i].index;
          break;
        }
      }
    }
  } else {
    // ticks are distributed in a single direction
    for (var _i = 0; _i < len; _i++) {
      if (_i === 0 && coordinate <= (ticks[_i].coordinate + ticks[_i + 1].coordinate) / 2 || _i > 0 && _i < len - 1 && coordinate > (ticks[_i].coordinate + ticks[_i - 1].coordinate) / 2 && coordinate <= (ticks[_i].coordinate + ticks[_i + 1].coordinate) / 2 || _i === len - 1 && coordinate > (ticks[_i].coordinate + ticks[_i - 1].coordinate) / 2) {
        index = ticks[_i].index;
        break;
      }
    }
  }
  return index;
};

/**
 * Get the main color of each graphic item
 * @param  {ReactElement} item A graphic item
 * @return {String}            Color
 */
var getMainColorOfGraphicItem = exports.getMainColorOfGraphicItem = function getMainColorOfGraphicItem(item) {
  var _item$type;
  var _ref = item,
    displayName = _ref.type.displayName; // TODO: check if displayName is valid.
  var defaultedProps = (_item$type = item.type) !== null && _item$type !== void 0 && _item$type.defaultProps ? _objectSpread(_objectSpread({}, item.type.defaultProps), item.props) : item.props;
  var stroke = defaultedProps.stroke,
    fill = defaultedProps.fill;
  var result;
  switch (displayName) {
    case 'Line':
      result = stroke;
      break;
    case 'Area':
    case 'Radar':
      result = stroke && stroke !== 'none' ? stroke : fill;
      break;
    default:
      result = fill;
      break;
  }
  return result;
};
/**
 * Calculate the size of all groups for stacked bar graph
 * @param  {Object} stackGroups The items grouped by axisId and stackId
 * @return {Object} The size of all groups
 */
var getBarSizeList = exports.getBarSizeList = function getBarSizeList(_ref2) {
  var globalSize = _ref2.barSize,
    totalSize = _ref2.totalSize,
    _ref2$stackGroups = _ref2.stackGroups,
    stackGroups = _ref2$stackGroups === void 0 ? {} : _ref2$stackGroups;
  if (!stackGroups) {
    return {};
  }
  var result = {};
  var numericAxisIds = Object.keys(stackGroups);
  for (var i = 0, len = numericAxisIds.length; i < len; i++) {
    var sgs = stackGroups[numericAxisIds[i]].stackGroups;
    var stackIds = Object.keys(sgs);
    for (var j = 0, sLen = stackIds.length; j < sLen; j++) {
      var _sgs$stackIds$j = sgs[stackIds[j]],
        items = _sgs$stackIds$j.items,
        cateAxisId = _sgs$stackIds$j.cateAxisId;
      var barItems = items.filter(function (item) {
        return (0, _ReactUtils.getDisplayName)(item.type).indexOf('Bar') >= 0;
      });
      if (barItems && barItems.length) {
        var barItemDefaultProps = barItems[0].type.defaultProps;
        var barItemProps = barItemDefaultProps !== undefined ? _objectSpread(_objectSpread({}, barItemDefaultProps), barItems[0].props) : barItems[0].props;
        var selfSize = barItemProps.barSize;
        var cateId = barItemProps[cateAxisId];
        if (!result[cateId]) {
          result[cateId] = [];
        }
        var barSize = (0, _isNil["default"])(selfSize) ? globalSize : selfSize;
        result[cateId].push({
          item: barItems[0],
          stackList: barItems.slice(1),
          barSize: (0, _isNil["default"])(barSize) ? undefined : (0, _DataUtils.getPercentValue)(barSize, totalSize, 0)
        });
      }
    }
  }
  return result;
};
/**
 * Calculate the size of each bar and offset between start of band and the bar
 *
 * @param  {number} bandSize is the size of area where bars can render
 * @param  {number | string} barGap is the gap size, as a percentage of `bandSize`.
 *                                  Can be defined as number or percent string
 * @param  {number | string} barCategoryGap is the gap size, as a percentage of `bandSize`.
 *                                  Can be defined as number or percent string
 * @param  {Array<object>} sizeList Sizes of all groups
 * @param  {number} maxBarSize The maximum size of each bar
 * @return {Array<object>} The size and offset of each bar
 */
var getBarPosition = exports.getBarPosition = function getBarPosition(_ref3) {
  var barGap = _ref3.barGap,
    barCategoryGap = _ref3.barCategoryGap,
    bandSize = _ref3.bandSize,
    _ref3$sizeList = _ref3.sizeList,
    sizeList = _ref3$sizeList === void 0 ? [] : _ref3$sizeList,
    maxBarSize = _ref3.maxBarSize;
  var len = sizeList.length;
  if (len < 1) return null;
  var realBarGap = (0, _DataUtils.getPercentValue)(barGap, bandSize, 0, true);
  var result;
  var initialValue = [];

  // whether or not is barSize setted by user
  if (sizeList[0].barSize === +sizeList[0].barSize) {
    var useFull = false;
    var fullBarSize = bandSize / len;
    // @ts-expect-error the type check above does not check for type number explicitly
    var sum = sizeList.reduce(function (res, entry) {
      return res + entry.barSize || 0;
    }, 0);
    sum += (len - 1) * realBarGap;
    if (sum >= bandSize) {
      sum -= (len - 1) * realBarGap;
      realBarGap = 0;
    }
    if (sum >= bandSize && fullBarSize > 0) {
      useFull = true;
      fullBarSize *= 0.9;
      sum = len * fullBarSize;
    }
    var offset = (bandSize - sum) / 2 >> 0;
    var prev = {
      offset: offset - realBarGap,
      size: 0
    };
    result = sizeList.reduce(function (res, entry) {
      var newPosition = {
        item: entry.item,
        position: {
          offset: prev.offset + prev.size + realBarGap,
          // @ts-expect-error the type check above does not check for type number explicitly
          size: useFull ? fullBarSize : entry.barSize
        }
      };
      var newRes = [].concat(_toConsumableArray(res), [newPosition]);
      prev = newRes[newRes.length - 1].position;
      if (entry.stackList && entry.stackList.length) {
        entry.stackList.forEach(function (item) {
          newRes.push({
            item: item,
            position: prev
          });
        });
      }
      return newRes;
    }, initialValue);
  } else {
    var _offset = (0, _DataUtils.getPercentValue)(barCategoryGap, bandSize, 0, true);
    if (bandSize - 2 * _offset - (len - 1) * realBarGap <= 0) {
      realBarGap = 0;
    }
    var originalSize = (bandSize - 2 * _offset - (len - 1) * realBarGap) / len;
    if (originalSize > 1) {
      originalSize >>= 0;
    }
    var size = maxBarSize === +maxBarSize ? Math.min(originalSize, maxBarSize) : originalSize;
    result = sizeList.reduce(function (res, entry, i) {
      var newRes = [].concat(_toConsumableArray(res), [{
        item: entry.item,
        position: {
          offset: _offset + (originalSize + realBarGap) * i + (originalSize - size) / 2,
          size: size
        }
      }]);
      if (entry.stackList && entry.stackList.length) {
        entry.stackList.forEach(function (item) {
          newRes.push({
            item: item,
            position: newRes[newRes.length - 1].position
          });
        });
      }
      return newRes;
    }, initialValue);
  }
  return result;
};
var appendOffsetOfLegend = exports.appendOffsetOfLegend = function appendOffsetOfLegend(offset, _unused, props, legendBox) {
  var children = props.children,
    width = props.width,
    margin = props.margin;
  var legendWidth = width - (margin.left || 0) - (margin.right || 0);
  var legendProps = (0, _getLegendProps.getLegendProps)({
    children: children,
    legendWidth: legendWidth
  });
  if (legendProps) {
    var _ref4 = legendBox || {},
      boxWidth = _ref4.width,
      boxHeight = _ref4.height;
    var align = legendProps.align,
      verticalAlign = legendProps.verticalAlign,
      layout = legendProps.layout;
    if ((layout === 'vertical' || layout === 'horizontal' && verticalAlign === 'middle') && align !== 'center' && (0, _DataUtils.isNumber)(offset[align])) {
      return _objectSpread(_objectSpread({}, offset), {}, _defineProperty({}, align, offset[align] + (boxWidth || 0)));
    }
    if ((layout === 'horizontal' || layout === 'vertical' && align === 'center') && verticalAlign !== 'middle' && (0, _DataUtils.isNumber)(offset[verticalAlign])) {
      return _objectSpread(_objectSpread({}, offset), {}, _defineProperty({}, verticalAlign, offset[verticalAlign] + (boxHeight || 0)));
    }
  }
  return offset;
};
var isErrorBarRelevantForAxis = function isErrorBarRelevantForAxis(layout, axisType, direction) {
  if ((0, _isNil["default"])(axisType)) {
    return true;
  }
  if (layout === 'horizontal') {
    return axisType === 'yAxis';
  }
  if (layout === 'vertical') {
    return axisType === 'xAxis';
  }
  if (direction === 'x') {
    return axisType === 'xAxis';
  }
  if (direction === 'y') {
    return axisType === 'yAxis';
  }
  return true;
};
var getDomainOfErrorBars = exports.getDomainOfErrorBars = function getDomainOfErrorBars(data, item, dataKey, layout, axisType) {
  var children = item.props.children;
  var errorBars = (0, _ReactUtils.findAllByType)(children, _ErrorBar.ErrorBar).filter(function (errorBarChild) {
    return isErrorBarRelevantForAxis(layout, axisType, errorBarChild.props.direction);
  });
  if (errorBars && errorBars.length) {
    var keys = errorBars.map(function (errorBarChild) {
      return errorBarChild.props.dataKey;
    });
    return data.reduce(function (result, entry) {
      var entryValue = getValueByDataKey(entry, dataKey);
      if ((0, _isNil["default"])(entryValue)) return result;
      var mainValue = Array.isArray(entryValue) ? [(0, _min["default"])(entryValue), (0, _max["default"])(entryValue)] : [entryValue, entryValue];
      var errorDomain = keys.reduce(function (prevErrorArr, k) {
        var errorValue = getValueByDataKey(entry, k, 0);
        var lowerValue = mainValue[0] - Math.abs(Array.isArray(errorValue) ? errorValue[0] : errorValue);
        var upperValue = mainValue[1] + Math.abs(Array.isArray(errorValue) ? errorValue[1] : errorValue);
        return [Math.min(lowerValue, prevErrorArr[0]), Math.max(upperValue, prevErrorArr[1])];
      }, [Infinity, -Infinity]);
      return [Math.min(errorDomain[0], result[0]), Math.max(errorDomain[1], result[1])];
    }, [Infinity, -Infinity]);
  }
  return null;
};
var parseErrorBarsOfAxis = exports.parseErrorBarsOfAxis = function parseErrorBarsOfAxis(data, items, dataKey, axisType, layout) {
  var domains = items.map(function (item) {
    return getDomainOfErrorBars(data, item, dataKey, layout, axisType);
  }).filter(function (entry) {
    return !(0, _isNil["default"])(entry);
  });
  if (domains && domains.length) {
    return domains.reduce(function (result, entry) {
      return [Math.min(result[0], entry[0]), Math.max(result[1], entry[1])];
    }, [Infinity, -Infinity]);
  }
  return null;
};

/**
 * Get domain of data by the configuration of item element
 * @param  {Array}   data      The data displayed in the chart
 * @param  {Array}   items     The instances of item
 * @param  {String}  type      The type of axis, number - Number Axis, category - Category Axis
 * @param  {LayoutType} layout The type of layout
 * @param  {Boolean} filterNil Whether or not filter nil values
 * @return {Array}        Domain
 */
var getDomainOfItemsWithSameAxis = exports.getDomainOfItemsWithSameAxis = function getDomainOfItemsWithSameAxis(data, items, type, layout, filterNil) {
  var domains = items.map(function (item) {
    var dataKey = item.props.dataKey;
    if (type === 'number' && dataKey) {
      return getDomainOfErrorBars(data, item, dataKey, layout) || getDomainOfDataByKey(data, dataKey, type, filterNil);
    }
    return getDomainOfDataByKey(data, dataKey, type, filterNil);
  });
  if (type === 'number') {
    // Calculate the domain of number axis
    return domains.reduce(
    // @ts-expect-error if (type === number) means that the domain is numerical type
    // - but this link is missing in the type definition
    function (result, entry) {
      return [Math.min(result[0], entry[0]), Math.max(result[1], entry[1])];
    }, [Infinity, -Infinity]);
  }
  var tag = {};
  // Get the union set of category axis
  return domains.reduce(function (result, entry) {
    for (var i = 0, len = entry.length; i < len; i++) {
      // @ts-expect-error Date cannot index an object
      if (!tag[entry[i]]) {
        // @ts-expect-error Date cannot index an object
        tag[entry[i]] = true;

        // @ts-expect-error Date cannot index an object
        result.push(entry[i]);
      }
    }
    return result;
  }, []);
};
var isCategoricalAxis = exports.isCategoricalAxis = function isCategoricalAxis(layout, axisType) {
  return layout === 'horizontal' && axisType === 'xAxis' || layout === 'vertical' && axisType === 'yAxis' || layout === 'centric' && axisType === 'angleAxis' || layout === 'radial' && axisType === 'radiusAxis';
};

/**
 * Calculate the Coordinates of grid
 * @param  {Array} ticks           The ticks in axis
 * @param {Number} minValue        The minimun value of axis
 * @param {Number} maxValue        The maximun value of axis
 * @param {boolean} syncWithTicks  Synchronize grid lines with ticks or not
 * @return {Array}                 Coordinates
 */
var getCoordinatesOfGrid = exports.getCoordinatesOfGrid = function getCoordinatesOfGrid(ticks, minValue, maxValue, syncWithTicks) {
  if (syncWithTicks) {
    return ticks.map(function (entry) {
      return entry.coordinate;
    });
  }
  var hasMin, hasMax;
  var values = ticks.map(function (entry) {
    if (entry.coordinate === minValue) {
      hasMin = true;
    }
    if (entry.coordinate === maxValue) {
      hasMax = true;
    }
    return entry.coordinate;
  });
  if (!hasMin) {
    values.push(minValue);
  }
  if (!hasMax) {
    values.push(maxValue);
  }
  return values;
};

/**
 * Get the ticks of an axis
 * @param  {Object}  axis The configuration of an axis
 * @param {Boolean} isGrid Whether or not are the ticks in grid
 * @param {Boolean} isAll Return the ticks of all the points or not
 * @return {Array}  Ticks
 */
var getTicksOfAxis = exports.getTicksOfAxis = function getTicksOfAxis(axis, isGrid, isAll) {
  if (!axis) return null;
  var scale = axis.scale;
  var duplicateDomain = axis.duplicateDomain,
    type = axis.type,
    range = axis.range;
  var offsetForBand = axis.realScaleType === 'scaleBand' ? scale.bandwidth() / 2 : 2;
  var offset = (isGrid || isAll) && type === 'category' && scale.bandwidth ? scale.bandwidth() / offsetForBand : 0;
  offset = axis.axisType === 'angleAxis' && (range === null || range === void 0 ? void 0 : range.length) >= 2 ? (0, _DataUtils.mathSign)(range[0] - range[1]) * 2 * offset : offset;

  // The ticks set by user should only affect the ticks adjacent to axis line
  if (isGrid && (axis.ticks || axis.niceTicks)) {
    var result = (axis.ticks || axis.niceTicks).map(function (entry) {
      var scaleContent = duplicateDomain ? duplicateDomain.indexOf(entry) : entry;
      return {
        // If the scaleContent is not a number, the coordinate will be NaN.
        // That could be the case for example with a PointScale and a string as domain.
        coordinate: scale(scaleContent) + offset,
        value: entry,
        offset: offset
      };
    });
    return result.filter(function (row) {
      return !(0, _isNaN["default"])(row.coordinate);
    });
  }

  // When axis is a categorial axis, but the type of axis is number or the scale of axis is not "auto"
  if (axis.isCategorical && axis.categoricalDomain) {
    return axis.categoricalDomain.map(function (entry, index) {
      return {
        coordinate: scale(entry) + offset,
        value: entry,
        index: index,
        offset: offset
      };
    });
  }
  if (scale.ticks && !isAll) {
    return scale.ticks(axis.tickCount).map(function (entry) {
      return {
        coordinate: scale(entry) + offset,
        value: entry,
        offset: offset
      };
    });
  }

  // When axis has duplicated text, serial numbers are used to generate scale
  return scale.domain().map(function (entry, index) {
    return {
      coordinate: scale(entry) + offset,
      value: duplicateDomain ? duplicateDomain[entry] : entry,
      index: index,
      offset: offset
    };
  });
};

/**
 * combine the handlers
 * @param  {Function} defaultHandler Internal private handler
 * @param  {Function} childHandler Handler function specified in child component
 * @return {Function}                The combined handler
 */

var handlerWeakMap = new WeakMap();
var combineEventHandlers = exports.combineEventHandlers = function combineEventHandlers(defaultHandler, childHandler) {
  if (typeof childHandler !== 'function') {
    return defaultHandler;
  }
  if (!handlerWeakMap.has(defaultHandler)) {
    handlerWeakMap.set(defaultHandler, new WeakMap());
  }
  var childWeakMap = handlerWeakMap.get(defaultHandler);
  if (childWeakMap.has(childHandler)) {
    return childWeakMap.get(childHandler);
  }
  var combineHandler = function combineHandler() {
    defaultHandler.apply(void 0, arguments);
    childHandler.apply(void 0, arguments);
  };
  childWeakMap.set(childHandler, combineHandler);
  return combineHandler;
};

/**
 * Parse the scale function of axis
 * @param  {Object}   axis          The option of axis
 * @param  {String}   chartType     The displayName of chart
 * @param  {Boolean}  hasBar        if it has a bar
 * @return {object}               The scale function and resolved name
 */
var parseScale = exports.parseScale = function parseScale(axis, chartType, hasBar) {
  var scale = axis.scale,
    type = axis.type,
    layout = axis.layout,
    axisType = axis.axisType;
  if (scale === 'auto') {
    if (layout === 'radial' && axisType === 'radiusAxis') {
      return {
        scale: d3Scales.scaleBand(),
        realScaleType: 'band'
      };
    }
    if (layout === 'radial' && axisType === 'angleAxis') {
      return {
        scale: d3Scales.scaleLinear(),
        realScaleType: 'linear'
      };
    }
    if (type === 'category' && chartType && (chartType.indexOf('LineChart') >= 0 || chartType.indexOf('AreaChart') >= 0 || chartType.indexOf('ComposedChart') >= 0 && !hasBar)) {
      return {
        scale: d3Scales.scalePoint(),
        realScaleType: 'point'
      };
    }
    if (type === 'category') {
      return {
        scale: d3Scales.scaleBand(),
        realScaleType: 'band'
      };
    }
    return {
      scale: d3Scales.scaleLinear(),
      realScaleType: 'linear'
    };
  }
  if ((0, _isString["default"])(scale)) {
    var name = "scale".concat((0, _upperFirst["default"])(scale));
    return {
      scale: (d3Scales[name] || d3Scales.scalePoint)(),
      realScaleType: d3Scales[name] ? name : 'point'
    };
  }
  return (0, _isFunction["default"])(scale) ? {
    scale: scale
  } : {
    scale: d3Scales.scalePoint(),
    realScaleType: 'point'
  };
};
var EPS = 1e-4;
var checkDomainOfScale = exports.checkDomainOfScale = function checkDomainOfScale(scale) {
  var domain = scale.domain();
  if (!domain || domain.length <= 2) {
    return;
  }
  var len = domain.length;
  var range = scale.range();
  var minValue = Math.min(range[0], range[1]) - EPS;
  var maxValue = Math.max(range[0], range[1]) + EPS;
  var first = scale(domain[0]);
  var last = scale(domain[len - 1]);
  if (first < minValue || first > maxValue || last < minValue || last > maxValue) {
    scale.domain([domain[0], domain[len - 1]]);
  }
};
var findPositionOfBar = exports.findPositionOfBar = function findPositionOfBar(barPosition, child) {
  if (!barPosition) {
    return null;
  }
  for (var i = 0, len = barPosition.length; i < len; i++) {
    if (barPosition[i].item === child) {
      return barPosition[i].position;
    }
  }
  return null;
};

/**
 * Both value and domain are tuples of two numbers
 * - but the type stays as array of numbers until we have better support in rest of the app
 * @param {Array} value input that will be truncated
 * @param {Array} domain boundaries
 * @returns {Array} tuple of two numbers
 */
var truncateByDomain = exports.truncateByDomain = function truncateByDomain(value, domain) {
  if (!domain || domain.length !== 2 || !(0, _DataUtils.isNumber)(domain[0]) || !(0, _DataUtils.isNumber)(domain[1])) {
    return value;
  }
  var minValue = Math.min(domain[0], domain[1]);
  var maxValue = Math.max(domain[0], domain[1]);
  var result = [value[0], value[1]];
  if (!(0, _DataUtils.isNumber)(value[0]) || value[0] < minValue) {
    result[0] = minValue;
  }
  if (!(0, _DataUtils.isNumber)(value[1]) || value[1] > maxValue) {
    result[1] = maxValue;
  }
  if (result[0] > maxValue) {
    result[0] = maxValue;
  }
  if (result[1] < minValue) {
    result[1] = minValue;
  }
  return result;
};

/**
 * Stacks all positive numbers above zero and all negative numbers below zero.
 *
 * If all values in the series are positive then this behaves the same as 'none' stacker.
 *
 * @param {Array} series from d3-shape Stack
 * @return {Array} series with applied offset
 */
var offsetSign = exports.offsetSign = function offsetSign(series) {
  var n = series.length;
  if (n <= 0) {
    return;
  }
  for (var j = 0, m = series[0].length; j < m; ++j) {
    var positive = 0;
    var negative = 0;
    for (var i = 0; i < n; ++i) {
      var value = (0, _isNaN["default"])(series[i][j][1]) ? series[i][j][0] : series[i][j][1];

      /* eslint-disable prefer-destructuring, no-param-reassign */
      if (value >= 0) {
        series[i][j][0] = positive;
        series[i][j][1] = positive + value;
        positive = series[i][j][1];
      } else {
        series[i][j][0] = negative;
        series[i][j][1] = negative + value;
        negative = series[i][j][1];
      }
      /* eslint-enable prefer-destructuring, no-param-reassign */
    }
  }
};

/**
 * Replaces all negative values with zero when stacking data.
 *
 * If all values in the series are positive then this behaves the same as 'none' stacker.
 *
 * @param {Array} series from d3-shape Stack
 * @return {Array} series with applied offset
 */
var offsetPositive = exports.offsetPositive = function offsetPositive(series) {
  var n = series.length;
  if (n <= 0) {
    return;
  }
  for (var j = 0, m = series[0].length; j < m; ++j) {
    var positive = 0;
    for (var i = 0; i < n; ++i) {
      var value = (0, _isNaN["default"])(series[i][j][1]) ? series[i][j][0] : series[i][j][1];

      /* eslint-disable prefer-destructuring, no-param-reassign */
      if (value >= 0) {
        series[i][j][0] = positive;
        series[i][j][1] = positive + value;
        positive = series[i][j][1];
      } else {
        series[i][j][0] = 0;
        series[i][j][1] = 0;
      }
      /* eslint-enable prefer-destructuring, no-param-reassign */
    }
  }
};

/**
 * Function type to compute offset for stacked data.
 *
 * d3-shape has something fishy going on with its types.
 * In @definitelytyped/d3-shape, this function (the offset accessor) is typed as Series<> => void.
 * However! When I actually open the storybook I can see that the offset accessor actually receives Array<Series<>>.
 * The same I can see in the source code itself:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/66042
 * That one unfortunately has no types but we can tell it passes three-dimensional array.
 *
 * Which leads me to believe that definitelytyped is wrong on this one.
 * There's open discussion on this topic without much attention:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/66042
 */

var STACK_OFFSET_MAP = {
  sign: offsetSign,
  // @ts-expect-error definitelytyped types are incorrect
  expand: _d3Shape.stackOffsetExpand,
  // @ts-expect-error definitelytyped types are incorrect
  none: _d3Shape.stackOffsetNone,
  // @ts-expect-error definitelytyped types are incorrect
  silhouette: _d3Shape.stackOffsetSilhouette,
  // @ts-expect-error definitelytyped types are incorrect
  wiggle: _d3Shape.stackOffsetWiggle,
  positive: offsetPositive
};
var getStackedData = exports.getStackedData = function getStackedData(data, stackItems, offsetType) {
  var dataKeys = stackItems.map(function (item) {
    return item.props.dataKey;
  });
  var offsetAccessor = STACK_OFFSET_MAP[offsetType];
  var stack = (0, _d3Shape.stack)()
  // @ts-expect-error stack.keys type wants an array of strings, but we provide array of DataKeys
  .keys(dataKeys).value(function (d, key) {
    return +getValueByDataKey(d, key, 0);
  }).order(_d3Shape.stackOrderNone)
  // @ts-expect-error definitelytyped types are incorrect
  .offset(offsetAccessor);
  return stack(data);
};
var getStackGroupsByAxisId = exports.getStackGroupsByAxisId = function getStackGroupsByAxisId(data, _items, numericAxisId, cateAxisId, offsetType, reverseStackOrder) {
  if (!data) {
    return null;
  }

  // reversing items to affect render order (for layering)
  var items = reverseStackOrder ? _items.reverse() : _items;
  var parentStackGroupsInitialValue = {};
  var stackGroups = items.reduce(function (result, item) {
    var _item$type2;
    var defaultedProps = (_item$type2 = item.type) !== null && _item$type2 !== void 0 && _item$type2.defaultProps ? _objectSpread(_objectSpread({}, item.type.defaultProps), item.props) : item.props;
    var stackId = defaultedProps.stackId,
      hide = defaultedProps.hide;
    if (hide) {
      return result;
    }
    var axisId = defaultedProps[numericAxisId];
    var parentGroup = result[axisId] || {
      hasStack: false,
      stackGroups: {}
    };
    if ((0, _DataUtils.isNumOrStr)(stackId)) {
      var childGroup = parentGroup.stackGroups[stackId] || {
        numericAxisId: numericAxisId,
        cateAxisId: cateAxisId,
        items: []
      };
      childGroup.items.push(item);
      parentGroup.hasStack = true;
      parentGroup.stackGroups[stackId] = childGroup;
    } else {
      parentGroup.stackGroups[(0, _DataUtils.uniqueId)('_stackId_')] = {
        numericAxisId: numericAxisId,
        cateAxisId: cateAxisId,
        items: [item]
      };
    }
    return _objectSpread(_objectSpread({}, result), {}, _defineProperty({}, axisId, parentGroup));
  }, parentStackGroupsInitialValue);
  var axisStackGroupsInitialValue = {};
  return Object.keys(stackGroups).reduce(function (result, axisId) {
    var group = stackGroups[axisId];
    if (group.hasStack) {
      var stackGroupsInitialValue = {};
      group.stackGroups = Object.keys(group.stackGroups).reduce(function (res, stackId) {
        var g = group.stackGroups[stackId];
        return _objectSpread(_objectSpread({}, res), {}, _defineProperty({}, stackId, {
          numericAxisId: numericAxisId,
          cateAxisId: cateAxisId,
          items: g.items,
          stackedData: getStackedData(data, g.items, offsetType)
        }));
      }, stackGroupsInitialValue);
    }
    return _objectSpread(_objectSpread({}, result), {}, _defineProperty({}, axisId, group));
  }, axisStackGroupsInitialValue);
};

/**
 * Configure the scale function of axis
 * @param {Object} scale The scale function
 * @param {Object} opts  The configuration of axis
 * @return {Object}      null
 */
var getTicksOfScale = exports.getTicksOfScale = function getTicksOfScale(scale, opts) {
  var realScaleType = opts.realScaleType,
    type = opts.type,
    tickCount = opts.tickCount,
    originalDomain = opts.originalDomain,
    allowDecimals = opts.allowDecimals;
  var scaleType = realScaleType || opts.scale;
  if (scaleType !== 'auto' && scaleType !== 'linear') {
    return null;
  }
  if (tickCount && type === 'number' && originalDomain && (originalDomain[0] === 'auto' || originalDomain[1] === 'auto')) {
    // Calculate the ticks by the number of grid when the axis is a number axis
    var domain = scale.domain();
    if (!domain.length) {
      return null;
    }
    var tickValues = (0, _rechartsScale.getNiceTickValues)(domain, tickCount, allowDecimals);
    scale.domain([(0, _min["default"])(tickValues), (0, _max["default"])(tickValues)]);
    return {
      niceTicks: tickValues
    };
  }
  if (tickCount && type === 'number') {
    var _domain = scale.domain();
    var _tickValues = (0, _rechartsScale.getTickValuesFixedDomain)(_domain, tickCount, allowDecimals);
    return {
      niceTicks: _tickValues
    };
  }
  return null;
};
function getCateCoordinateOfLine(_ref5) {
  var axis = _ref5.axis,
    ticks = _ref5.ticks,
    bandSize = _ref5.bandSize,
    entry = _ref5.entry,
    index = _ref5.index,
    dataKey = _ref5.dataKey;
  if (axis.type === 'category') {
    // find coordinate of category axis by the value of category
    // @ts-expect-error why does this use direct object access instead of getValueByDataKey?
    if (!axis.allowDuplicatedCategory && axis.dataKey && !(0, _isNil["default"])(entry[axis.dataKey])) {
      // @ts-expect-error why does this use direct object access instead of getValueByDataKey?
      var matchedTick = (0, _DataUtils.findEntryInArray)(ticks, 'value', entry[axis.dataKey]);
      if (matchedTick) {
        return matchedTick.coordinate + bandSize / 2;
      }
    }
    return ticks[index] ? ticks[index].coordinate + bandSize / 2 : null;
  }
  var value = getValueByDataKey(entry, !(0, _isNil["default"])(dataKey) ? dataKey : axis.dataKey);
  return !(0, _isNil["default"])(value) ? axis.scale(value) : null;
}
var getCateCoordinateOfBar = exports.getCateCoordinateOfBar = function getCateCoordinateOfBar(_ref6) {
  var axis = _ref6.axis,
    ticks = _ref6.ticks,
    offset = _ref6.offset,
    bandSize = _ref6.bandSize,
    entry = _ref6.entry,
    index = _ref6.index;
  if (axis.type === 'category') {
    return ticks[index] ? ticks[index].coordinate + offset : null;
  }
  var value = getValueByDataKey(entry, axis.dataKey, axis.domain[index]);
  return !(0, _isNil["default"])(value) ? axis.scale(value) - bandSize / 2 + offset : null;
};
var getBaseValueOfBar = exports.getBaseValueOfBar = function getBaseValueOfBar(_ref7) {
  var numericAxis = _ref7.numericAxis;
  var domain = numericAxis.scale.domain();
  if (numericAxis.type === 'number') {
    var minValue = Math.min(domain[0], domain[1]);
    var maxValue = Math.max(domain[0], domain[1]);
    if (minValue <= 0 && maxValue >= 0) {
      return 0;
    }
    if (maxValue < 0) {
      return maxValue;
    }
    return minValue;
  }
  return domain[0];
};
var getStackedDataOfItem = exports.getStackedDataOfItem = function getStackedDataOfItem(item, stackGroups) {
  var _item$type3;
  var defaultedProps = (_item$type3 = item.type) !== null && _item$type3 !== void 0 && _item$type3.defaultProps ? _objectSpread(_objectSpread({}, item.type.defaultProps), item.props) : item.props;
  var stackId = defaultedProps.stackId;
  if ((0, _DataUtils.isNumOrStr)(stackId)) {
    var group = stackGroups[stackId];
    if (group) {
      var itemIndex = group.items.indexOf(item);
      return itemIndex >= 0 ? group.stackedData[itemIndex] : null;
    }
  }
  return null;
};
var getDomainOfSingle = function getDomainOfSingle(data) {
  return data.reduce(function (result, entry) {
    return [(0, _min["default"])(entry.concat([result[0]]).filter(_DataUtils.isNumber)), (0, _max["default"])(entry.concat([result[1]]).filter(_DataUtils.isNumber))];
  }, [Infinity, -Infinity]);
};
var getDomainOfStackGroups = exports.getDomainOfStackGroups = function getDomainOfStackGroups(stackGroups, startIndex, endIndex) {
  return Object.keys(stackGroups).reduce(function (result, stackId) {
    var group = stackGroups[stackId];
    var stackedData = group.stackedData;
    var domain = stackedData.reduce(function (res, entry) {
      var s = getDomainOfSingle(entry.slice(startIndex, endIndex + 1));
      return [Math.min(res[0], s[0]), Math.max(res[1], s[1])];
    }, [Infinity, -Infinity]);
    return [Math.min(domain[0], result[0]), Math.max(domain[1], result[1])];
  }, [Infinity, -Infinity]).map(function (result) {
    return result === Infinity || result === -Infinity ? 0 : result;
  });
};
var MIN_VALUE_REG = exports.MIN_VALUE_REG = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;
var MAX_VALUE_REG = exports.MAX_VALUE_REG = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;
var parseSpecifiedDomain = exports.parseSpecifiedDomain = function parseSpecifiedDomain(specifiedDomain, dataDomain, allowDataOverflow) {
  if ((0, _isFunction["default"])(specifiedDomain)) {
    return specifiedDomain(dataDomain, allowDataOverflow);
  }
  if (!Array.isArray(specifiedDomain)) {
    return dataDomain;
  }
  var domain = [];

  /* eslint-disable prefer-destructuring */
  if ((0, _DataUtils.isNumber)(specifiedDomain[0])) {
    domain[0] = allowDataOverflow ? specifiedDomain[0] : Math.min(specifiedDomain[0], dataDomain[0]);
  } else if (MIN_VALUE_REG.test(specifiedDomain[0])) {
    var value = +MIN_VALUE_REG.exec(specifiedDomain[0])[1];
    domain[0] = dataDomain[0] - value;
  } else if ((0, _isFunction["default"])(specifiedDomain[0])) {
    domain[0] = specifiedDomain[0](dataDomain[0]);
  } else {
    domain[0] = dataDomain[0];
  }
  if ((0, _DataUtils.isNumber)(specifiedDomain[1])) {
    domain[1] = allowDataOverflow ? specifiedDomain[1] : Math.max(specifiedDomain[1], dataDomain[1]);
  } else if (MAX_VALUE_REG.test(specifiedDomain[1])) {
    var _value = +MAX_VALUE_REG.exec(specifiedDomain[1])[1];
    domain[1] = dataDomain[1] + _value;
  } else if ((0, _isFunction["default"])(specifiedDomain[1])) {
    domain[1] = specifiedDomain[1](dataDomain[1]);
  } else {
    domain[1] = dataDomain[1];
  }
  /* eslint-enable prefer-destructuring */

  return domain;
};

/**
 * Calculate the size between two category
 * @param  {Object} axis  The options of axis
 * @param  {Array}  ticks The ticks of axis
 * @param  {Boolean} isBar if items in axis are bars
 * @return {Number} Size
 */
var getBandSizeOfAxis = exports.getBandSizeOfAxis = function getBandSizeOfAxis(axis, ticks, isBar) {
  // @ts-expect-error we need to rethink scale type
  if (axis && axis.scale && axis.scale.bandwidth) {
    // @ts-expect-error we need to rethink scale type
    var bandWidth = axis.scale.bandwidth();
    if (!isBar || bandWidth > 0) {
      return bandWidth;
    }
  }
  if (axis && ticks && ticks.length >= 2) {
    var orderedTicks = (0, _sortBy["default"])(ticks, function (o) {
      return o.coordinate;
    });
    var bandSize = Infinity;
    for (var i = 1, len = orderedTicks.length; i < len; i++) {
      var cur = orderedTicks[i];
      var prev = orderedTicks[i - 1];
      bandSize = Math.min((cur.coordinate || 0) - (prev.coordinate || 0), bandSize);
    }
    return bandSize === Infinity ? 0 : bandSize;
  }
  return isBar ? undefined : 0;
};
/**
 * parse the domain of a category axis when a domain is specified
 * @param   {Array}        specifiedDomain  The domain specified by users
 * @param   {Array}        calculatedDomain The domain calculated by dateKey
 * @param   {ReactElement} axisChild        The axis ReactElement
 * @returns {Array}        domains
 */
var parseDomainOfCategoryAxis = exports.parseDomainOfCategoryAxis = function parseDomainOfCategoryAxis(specifiedDomain, calculatedDomain, axisChild) {
  if (!specifiedDomain || !specifiedDomain.length) {
    return calculatedDomain;
  }
  if ((0, _isEqual["default"])(specifiedDomain, (0, _get["default"])(axisChild, 'type.defaultProps.domain'))) {
    return calculatedDomain;
  }
  return specifiedDomain;
};
var getTooltipItem = exports.getTooltipItem = function getTooltipItem(graphicalItem, payload) {
  var defaultedProps = graphicalItem.type.defaultProps ? _objectSpread(_objectSpread({}, graphicalItem.type.defaultProps), graphicalItem.props) : graphicalItem.props;
  var dataKey = defaultedProps.dataKey,
    name = defaultedProps.name,
    unit = defaultedProps.unit,
    formatter = defaultedProps.formatter,
    tooltipType = defaultedProps.tooltipType,
    chartType = defaultedProps.chartType,
    hide = defaultedProps.hide;
  return _objectSpread(_objectSpread({}, (0, _ReactUtils.filterProps)(graphicalItem, false)), {}, {
    dataKey: dataKey,
    unit: unit,
    formatter: formatter,
    name: name || dataKey,
    color: getMainColorOfGraphicItem(graphicalItem),
    value: getValueByDataKey(payload, dataKey),
    type: tooltipType,
    payload: payload,
    chartType: chartType,
    hide: hide
  });
};