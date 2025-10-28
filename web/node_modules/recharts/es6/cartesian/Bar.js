var _excluded = ["value", "background"];
var _Bar;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Render a group of bar
 */
import React, { PureComponent } from 'react';
import clsx from 'clsx';
import Animate from 'react-smooth';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import { Layer } from '../container/Layer';
import { ErrorBar } from './ErrorBar';
import { Cell } from '../component/Cell';
import { LabelList } from '../component/LabelList';
import { uniqueId, mathSign, interpolateNumber } from '../util/DataUtils';
import { filterProps, findAllByType } from '../util/ReactUtils';
import { Global } from '../util/Global';
import { getCateCoordinateOfBar, getValueByDataKey, truncateByDomain, getBaseValueOfBar, findPositionOfBar, getTooltipItem } from '../util/ChartUtils';
import { adaptEventsOfChild } from '../util/types';
import { BarRectangle, minPointSizeCallback } from '../util/BarUtils';
export var Bar = /*#__PURE__*/function (_PureComponent) {
  function Bar() {
    var _this;
    _classCallCheck(this, Bar);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Bar, [].concat(args));
    _defineProperty(_this, "state", {
      isAnimationFinished: false
    });
    _defineProperty(_this, "id", uniqueId('recharts-bar-'));
    _defineProperty(_this, "handleAnimationEnd", function () {
      var onAnimationEnd = _this.props.onAnimationEnd;
      _this.setState({
        isAnimationFinished: true
      });
      if (onAnimationEnd) {
        onAnimationEnd();
      }
    });
    _defineProperty(_this, "handleAnimationStart", function () {
      var onAnimationStart = _this.props.onAnimationStart;
      _this.setState({
        isAnimationFinished: false
      });
      if (onAnimationStart) {
        onAnimationStart();
      }
    });
    return _this;
  }
  _inherits(Bar, _PureComponent);
  return _createClass(Bar, [{
    key: "renderRectanglesStatically",
    value: function renderRectanglesStatically(data) {
      var _this2 = this;
      var _this$props = this.props,
        shape = _this$props.shape,
        dataKey = _this$props.dataKey,
        activeIndex = _this$props.activeIndex,
        activeBar = _this$props.activeBar;
      var baseProps = filterProps(this.props, false);
      return data && data.map(function (entry, i) {
        var isActive = i === activeIndex;
        var option = isActive ? activeBar : shape;
        var props = _objectSpread(_objectSpread(_objectSpread({}, baseProps), entry), {}, {
          isActive: isActive,
          option: option,
          index: i,
          dataKey: dataKey,
          onAnimationStart: _this2.handleAnimationStart,
          onAnimationEnd: _this2.handleAnimationEnd
        });
        return /*#__PURE__*/React.createElement(Layer, _extends({
          className: "recharts-bar-rectangle"
        }, adaptEventsOfChild(_this2.props, entry, i), {
          // https://github.com/recharts/recharts/issues/5415
          // eslint-disable-next-line react/no-array-index-key
          key: "rectangle-".concat(entry === null || entry === void 0 ? void 0 : entry.x, "-").concat(entry === null || entry === void 0 ? void 0 : entry.y, "-").concat(entry === null || entry === void 0 ? void 0 : entry.value, "-").concat(i)
        }), /*#__PURE__*/React.createElement(BarRectangle, props));
      });
    }
  }, {
    key: "renderRectanglesWithAnimation",
    value: function renderRectanglesWithAnimation() {
      var _this3 = this;
      var _this$props2 = this.props,
        data = _this$props2.data,
        layout = _this$props2.layout,
        isAnimationActive = _this$props2.isAnimationActive,
        animationBegin = _this$props2.animationBegin,
        animationDuration = _this$props2.animationDuration,
        animationEasing = _this$props2.animationEasing,
        animationId = _this$props2.animationId;
      var prevData = this.state.prevData;
      return /*#__PURE__*/React.createElement(Animate, {
        begin: animationBegin,
        duration: animationDuration,
        isActive: isAnimationActive,
        easing: animationEasing,
        from: {
          t: 0
        },
        to: {
          t: 1
        },
        key: "bar-".concat(animationId),
        onAnimationEnd: this.handleAnimationEnd,
        onAnimationStart: this.handleAnimationStart
      }, function (_ref) {
        var t = _ref.t;
        var stepData = data.map(function (entry, index) {
          var prev = prevData && prevData[index];
          if (prev) {
            var interpolatorX = interpolateNumber(prev.x, entry.x);
            var interpolatorY = interpolateNumber(prev.y, entry.y);
            var interpolatorWidth = interpolateNumber(prev.width, entry.width);
            var interpolatorHeight = interpolateNumber(prev.height, entry.height);
            return _objectSpread(_objectSpread({}, entry), {}, {
              x: interpolatorX(t),
              y: interpolatorY(t),
              width: interpolatorWidth(t),
              height: interpolatorHeight(t)
            });
          }
          if (layout === 'horizontal') {
            var _interpolatorHeight = interpolateNumber(0, entry.height);
            var h = _interpolatorHeight(t);
            return _objectSpread(_objectSpread({}, entry), {}, {
              y: entry.y + entry.height - h,
              height: h
            });
          }
          var interpolator = interpolateNumber(0, entry.width);
          var w = interpolator(t);
          return _objectSpread(_objectSpread({}, entry), {}, {
            width: w
          });
        });
        return /*#__PURE__*/React.createElement(Layer, null, _this3.renderRectanglesStatically(stepData));
      });
    }
  }, {
    key: "renderRectangles",
    value: function renderRectangles() {
      var _this$props3 = this.props,
        data = _this$props3.data,
        isAnimationActive = _this$props3.isAnimationActive;
      var prevData = this.state.prevData;
      if (isAnimationActive && data && data.length && (!prevData || !isEqual(prevData, data))) {
        return this.renderRectanglesWithAnimation();
      }
      return this.renderRectanglesStatically(data);
    }
  }, {
    key: "renderBackground",
    value: function renderBackground() {
      var _this4 = this;
      var _this$props4 = this.props,
        data = _this$props4.data,
        dataKey = _this$props4.dataKey,
        activeIndex = _this$props4.activeIndex;
      var backgroundProps = filterProps(this.props.background, false);
      return data.map(function (entry, i) {
        var value = entry.value,
          background = entry.background,
          rest = _objectWithoutProperties(entry, _excluded);
        if (!background) {
          return null;
        }
        var props = _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, rest), {}, {
          fill: '#eee'
        }, background), backgroundProps), adaptEventsOfChild(_this4.props, entry, i)), {}, {
          onAnimationStart: _this4.handleAnimationStart,
          onAnimationEnd: _this4.handleAnimationEnd,
          dataKey: dataKey,
          index: i,
          className: 'recharts-bar-background-rectangle'
        });
        return /*#__PURE__*/React.createElement(BarRectangle, _extends({
          key: "background-bar-".concat(i),
          option: _this4.props.background,
          isActive: i === activeIndex
        }, props));
      });
    }
  }, {
    key: "renderErrorBar",
    value: function renderErrorBar(needClip, clipPathId) {
      if (this.props.isAnimationActive && !this.state.isAnimationFinished) {
        return null;
      }
      var _this$props5 = this.props,
        data = _this$props5.data,
        xAxis = _this$props5.xAxis,
        yAxis = _this$props5.yAxis,
        layout = _this$props5.layout,
        children = _this$props5.children;
      var errorBarItems = findAllByType(children, ErrorBar);
      if (!errorBarItems) {
        return null;
      }
      var offset = layout === 'vertical' ? data[0].height / 2 : data[0].width / 2;
      var dataPointFormatter = function dataPointFormatter(dataPoint, dataKey) {
        /**
         * if the value coming from `getComposedData` is an array then this is a stacked bar chart.
         * arr[1] represents end value of the bar since the data is in the form of [startValue, endValue].
         * */
        var value = Array.isArray(dataPoint.value) ? dataPoint.value[1] : dataPoint.value;
        return {
          x: dataPoint.x,
          y: dataPoint.y,
          value: value,
          errorVal: getValueByDataKey(dataPoint, dataKey)
        };
      };
      var errorBarProps = {
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null
      };
      return /*#__PURE__*/React.createElement(Layer, errorBarProps, errorBarItems.map(function (item) {
        return /*#__PURE__*/React.cloneElement(item, {
          key: "error-bar-".concat(clipPathId, "-").concat(item.props.dataKey),
          data: data,
          xAxis: xAxis,
          yAxis: yAxis,
          layout: layout,
          offset: offset,
          dataPointFormatter: dataPointFormatter
        });
      }));
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props6 = this.props,
        hide = _this$props6.hide,
        data = _this$props6.data,
        className = _this$props6.className,
        xAxis = _this$props6.xAxis,
        yAxis = _this$props6.yAxis,
        left = _this$props6.left,
        top = _this$props6.top,
        width = _this$props6.width,
        height = _this$props6.height,
        isAnimationActive = _this$props6.isAnimationActive,
        background = _this$props6.background,
        id = _this$props6.id;
      if (hide || !data || !data.length) {
        return null;
      }
      var isAnimationFinished = this.state.isAnimationFinished;
      var layerClass = clsx('recharts-bar', className);
      var needClipX = xAxis && xAxis.allowDataOverflow;
      var needClipY = yAxis && yAxis.allowDataOverflow;
      var needClip = needClipX || needClipY;
      var clipPathId = isNil(id) ? this.id : id;
      return /*#__PURE__*/React.createElement(Layer, {
        className: layerClass
      }, needClipX || needClipY ? /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
        id: "clipPath-".concat(clipPathId)
      }, /*#__PURE__*/React.createElement("rect", {
        x: needClipX ? left : left - width / 2,
        y: needClipY ? top : top - height / 2,
        width: needClipX ? width : width * 2,
        height: needClipY ? height : height * 2
      }))) : null, /*#__PURE__*/React.createElement(Layer, {
        className: "recharts-bar-rectangles",
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null
      }, background ? this.renderBackground() : null, this.renderRectangles()), this.renderErrorBar(needClip, clipPathId), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, data));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curData: nextProps.data,
          prevData: prevState.curData
        };
      }
      if (nextProps.data !== prevState.curData) {
        return {
          curData: nextProps.data
        };
      }
      return null;
    }
  }]);
}(PureComponent);
_Bar = Bar;
_defineProperty(Bar, "displayName", 'Bar');
_defineProperty(Bar, "defaultProps", {
  xAxisId: 0,
  yAxisId: 0,
  legendType: 'rect',
  minPointSize: 0,
  hide: false,
  data: [],
  layout: 'vertical',
  activeBar: false,
  isAnimationActive: !Global.isSsr,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'ease'
});
/**
 * Compose the data of each group
 * @param {Object} props Props for the component
 * @param {Object} item        An instance of Bar
 * @param {Array} barPosition  The offset and size of each bar
 * @param {Object} xAxis       The configuration of x-axis
 * @param {Object} yAxis       The configuration of y-axis
 * @param {Array} stackedData  The stacked data of a bar item
 * @return{Array} Composed data
 */
_defineProperty(Bar, "getComposedData", function (_ref2) {
  var props = _ref2.props,
    item = _ref2.item,
    barPosition = _ref2.barPosition,
    bandSize = _ref2.bandSize,
    xAxis = _ref2.xAxis,
    yAxis = _ref2.yAxis,
    xAxisTicks = _ref2.xAxisTicks,
    yAxisTicks = _ref2.yAxisTicks,
    stackedData = _ref2.stackedData,
    dataStartIndex = _ref2.dataStartIndex,
    displayedData = _ref2.displayedData,
    offset = _ref2.offset;
  var pos = findPositionOfBar(barPosition, item);
  if (!pos) {
    return null;
  }
  var layout = props.layout;
  var itemDefaultProps = item.type.defaultProps;
  var itemProps = itemDefaultProps !== undefined ? _objectSpread(_objectSpread({}, itemDefaultProps), item.props) : item.props;
  var dataKey = itemProps.dataKey,
    children = itemProps.children,
    minPointSizeProp = itemProps.minPointSize;
  var numericAxis = layout === 'horizontal' ? yAxis : xAxis;
  var stackedDomain = stackedData ? numericAxis.scale.domain() : null;
  var baseValue = getBaseValueOfBar({
    numericAxis: numericAxis
  });
  var cells = findAllByType(children, Cell);
  var rects = displayedData.map(function (entry, index) {
    var value, x, y, width, height, background;
    if (stackedData) {
      value = truncateByDomain(stackedData[dataStartIndex + index], stackedDomain);
    } else {
      value = getValueByDataKey(entry, dataKey);
      if (!Array.isArray(value)) {
        value = [baseValue, value];
      }
    }
    var minPointSize = minPointSizeCallback(minPointSizeProp, _Bar.defaultProps.minPointSize)(value[1], index);
    if (layout === 'horizontal') {
      var _ref4;
      var _ref3 = [yAxis.scale(value[0]), yAxis.scale(value[1])],
        baseValueScale = _ref3[0],
        currentValueScale = _ref3[1];
      x = getCateCoordinateOfBar({
        axis: xAxis,
        ticks: xAxisTicks,
        bandSize: bandSize,
        offset: pos.offset,
        entry: entry,
        index: index
      });
      y = (_ref4 = currentValueScale !== null && currentValueScale !== void 0 ? currentValueScale : baseValueScale) !== null && _ref4 !== void 0 ? _ref4 : undefined;
      width = pos.size;
      var computedHeight = baseValueScale - currentValueScale;
      height = Number.isNaN(computedHeight) ? 0 : computedHeight;
      background = {
        x: x,
        y: yAxis.y,
        width: width,
        height: yAxis.height
      };
      if (Math.abs(minPointSize) > 0 && Math.abs(height) < Math.abs(minPointSize)) {
        var delta = mathSign(height || minPointSize) * (Math.abs(minPointSize) - Math.abs(height));
        y -= delta;
        height += delta;
      }
    } else {
      var _ref5 = [xAxis.scale(value[0]), xAxis.scale(value[1])],
        _baseValueScale = _ref5[0],
        _currentValueScale = _ref5[1];
      x = _baseValueScale;
      y = getCateCoordinateOfBar({
        axis: yAxis,
        ticks: yAxisTicks,
        bandSize: bandSize,
        offset: pos.offset,
        entry: entry,
        index: index
      });
      width = _currentValueScale - _baseValueScale;
      height = pos.size;
      background = {
        x: xAxis.x,
        y: y,
        width: xAxis.width,
        height: height
      };
      if (Math.abs(minPointSize) > 0 && Math.abs(width) < Math.abs(minPointSize)) {
        var _delta = mathSign(width || minPointSize) * (Math.abs(minPointSize) - Math.abs(width));
        width += _delta;
      }
    }
    return _objectSpread(_objectSpread(_objectSpread({}, entry), {}, {
      x: x,
      y: y,
      width: width,
      height: height,
      value: stackedData ? value : value[1],
      payload: entry,
      background: background
    }, cells && cells[index] && cells[index].props), {}, {
      tooltipPayload: [getTooltipItem(item, entry)],
      tooltipPosition: {
        x: x + width / 2,
        y: y + height / 2
      }
    });
  });
  return _objectSpread({
    data: rects,
    layout: layout
  }, offset);
});