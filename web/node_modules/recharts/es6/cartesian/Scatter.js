var _Scatter;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
 * @fileOverview Render a group of scatters
 */
import React, { PureComponent } from 'react';
import Animate from 'react-smooth';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import isFunction from 'lodash/isFunction';
import clsx from 'clsx';
import { Layer } from '../container/Layer';
import { LabelList } from '../component/LabelList';
import { findAllByType, filterProps } from '../util/ReactUtils';
import { Global } from '../util/Global';
import { ZAxis } from './ZAxis';
import { Curve } from '../shape/Curve';
import { ErrorBar } from './ErrorBar';
import { Cell } from '../component/Cell';
import { uniqueId, interpolateNumber, getLinearRegression } from '../util/DataUtils';
import { getValueByDataKey, getCateCoordinateOfLine } from '../util/ChartUtils';
import { adaptEventsOfChild } from '../util/types';
import { ScatterSymbol } from '../util/ScatterUtils';
export var Scatter = /*#__PURE__*/function (_PureComponent) {
  function Scatter() {
    var _this;
    _classCallCheck(this, Scatter);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Scatter, [].concat(args));
    _defineProperty(_this, "state", {
      isAnimationFinished: false
    });
    _defineProperty(_this, "handleAnimationEnd", function () {
      _this.setState({
        isAnimationFinished: true
      });
    });
    _defineProperty(_this, "handleAnimationStart", function () {
      _this.setState({
        isAnimationFinished: false
      });
    });
    _defineProperty(_this, "id", uniqueId('recharts-scatter-'));
    return _this;
  }
  _inherits(Scatter, _PureComponent);
  return _createClass(Scatter, [{
    key: "renderSymbolsStatically",
    value: function renderSymbolsStatically(points) {
      var _this2 = this;
      var _this$props = this.props,
        shape = _this$props.shape,
        activeShape = _this$props.activeShape,
        activeIndex = _this$props.activeIndex;
      var baseProps = filterProps(this.props, false);
      return points.map(function (entry, i) {
        var isActive = activeIndex === i;
        var option = isActive ? activeShape : shape;
        var props = _objectSpread(_objectSpread({}, baseProps), entry);
        return /*#__PURE__*/React.createElement(Layer, _extends({
          className: "recharts-scatter-symbol"
          // eslint-disable-next-line react/no-array-index-key
          ,
          key: "symbol-".concat(entry === null || entry === void 0 ? void 0 : entry.cx, "-").concat(entry === null || entry === void 0 ? void 0 : entry.cy, "-").concat(entry === null || entry === void 0 ? void 0 : entry.size, "-").concat(i)
        }, adaptEventsOfChild(_this2.props, entry, i), {
          role: "img"
        }), /*#__PURE__*/React.createElement(ScatterSymbol, _extends({
          option: option,
          isActive: isActive
          // eslint-disable-next-line react/no-array-index-key
          ,
          key: "symbol-".concat(i)
        }, props)));
      });
    }
  }, {
    key: "renderSymbolsWithAnimation",
    value: function renderSymbolsWithAnimation() {
      var _this3 = this;
      var _this$props2 = this.props,
        points = _this$props2.points,
        isAnimationActive = _this$props2.isAnimationActive,
        animationBegin = _this$props2.animationBegin,
        animationDuration = _this$props2.animationDuration,
        animationEasing = _this$props2.animationEasing,
        animationId = _this$props2.animationId;
      var prevPoints = this.state.prevPoints;
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
        key: "pie-".concat(animationId),
        onAnimationEnd: this.handleAnimationEnd,
        onAnimationStart: this.handleAnimationStart
      }, function (_ref) {
        var t = _ref.t;
        var stepData = points.map(function (entry, index) {
          var prev = prevPoints && prevPoints[index];
          if (prev) {
            var interpolatorCx = interpolateNumber(prev.cx, entry.cx);
            var interpolatorCy = interpolateNumber(prev.cy, entry.cy);
            var interpolatorSize = interpolateNumber(prev.size, entry.size);
            return _objectSpread(_objectSpread({}, entry), {}, {
              cx: interpolatorCx(t),
              cy: interpolatorCy(t),
              size: interpolatorSize(t)
            });
          }
          var interpolator = interpolateNumber(0, entry.size);
          return _objectSpread(_objectSpread({}, entry), {}, {
            size: interpolator(t)
          });
        });
        return /*#__PURE__*/React.createElement(Layer, null, _this3.renderSymbolsStatically(stepData));
      });
    }
  }, {
    key: "renderSymbols",
    value: function renderSymbols() {
      var _this$props3 = this.props,
        points = _this$props3.points,
        isAnimationActive = _this$props3.isAnimationActive;
      var prevPoints = this.state.prevPoints;
      if (isAnimationActive && points && points.length && (!prevPoints || !isEqual(prevPoints, points))) {
        return this.renderSymbolsWithAnimation();
      }
      return this.renderSymbolsStatically(points);
    }
  }, {
    key: "renderErrorBar",
    value: function renderErrorBar() {
      var isAnimationActive = this.props.isAnimationActive;
      if (isAnimationActive && !this.state.isAnimationFinished) {
        return null;
      }
      var _this$props4 = this.props,
        points = _this$props4.points,
        xAxis = _this$props4.xAxis,
        yAxis = _this$props4.yAxis,
        children = _this$props4.children;
      var errorBarItems = findAllByType(children, ErrorBar);
      if (!errorBarItems) {
        return null;
      }
      return errorBarItems.map(function (item, i) {
        var _item$props = item.props,
          direction = _item$props.direction,
          errorDataKey = _item$props.dataKey;
        return /*#__PURE__*/React.cloneElement(item, {
          key: "".concat(direction, "-").concat(errorDataKey, "-").concat(points[i]),
          data: points,
          xAxis: xAxis,
          yAxis: yAxis,
          layout: direction === 'x' ? 'vertical' : 'horizontal',
          dataPointFormatter: function dataPointFormatter(dataPoint, dataKey) {
            return {
              x: dataPoint.cx,
              y: dataPoint.cy,
              value: direction === 'x' ? +dataPoint.node.x : +dataPoint.node.y,
              errorVal: getValueByDataKey(dataPoint, dataKey)
            };
          }
        });
      });
    }
  }, {
    key: "renderLine",
    value: function renderLine() {
      var _this$props5 = this.props,
        points = _this$props5.points,
        line = _this$props5.line,
        lineType = _this$props5.lineType,
        lineJointType = _this$props5.lineJointType;
      var scatterProps = filterProps(this.props, false);
      var customLineProps = filterProps(line, false);
      var linePoints, lineItem;
      if (lineType === 'joint') {
        linePoints = points.map(function (entry) {
          return {
            x: entry.cx,
            y: entry.cy
          };
        });
      } else if (lineType === 'fitting') {
        var _getLinearRegression = getLinearRegression(points),
          xmin = _getLinearRegression.xmin,
          xmax = _getLinearRegression.xmax,
          a = _getLinearRegression.a,
          b = _getLinearRegression.b;
        var linearExp = function linearExp(x) {
          return a * x + b;
        };
        linePoints = [{
          x: xmin,
          y: linearExp(xmin)
        }, {
          x: xmax,
          y: linearExp(xmax)
        }];
      }
      var lineProps = _objectSpread(_objectSpread(_objectSpread({}, scatterProps), {}, {
        fill: 'none',
        stroke: scatterProps && scatterProps.fill
      }, customLineProps), {}, {
        points: linePoints
      });
      if ( /*#__PURE__*/React.isValidElement(line)) {
        lineItem = /*#__PURE__*/React.cloneElement(line, lineProps);
      } else if (isFunction(line)) {
        lineItem = line(lineProps);
      } else {
        lineItem = /*#__PURE__*/React.createElement(Curve, _extends({}, lineProps, {
          type: lineJointType
        }));
      }
      return /*#__PURE__*/React.createElement(Layer, {
        className: "recharts-scatter-line",
        key: "recharts-scatter-line"
      }, lineItem);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props6 = this.props,
        hide = _this$props6.hide,
        points = _this$props6.points,
        line = _this$props6.line,
        className = _this$props6.className,
        xAxis = _this$props6.xAxis,
        yAxis = _this$props6.yAxis,
        left = _this$props6.left,
        top = _this$props6.top,
        width = _this$props6.width,
        height = _this$props6.height,
        id = _this$props6.id,
        isAnimationActive = _this$props6.isAnimationActive;
      if (hide || !points || !points.length) {
        return null;
      }
      var isAnimationFinished = this.state.isAnimationFinished;
      var layerClass = clsx('recharts-scatter', className);
      var needClipX = xAxis && xAxis.allowDataOverflow;
      var needClipY = yAxis && yAxis.allowDataOverflow;
      var needClip = needClipX || needClipY;
      var clipPathId = isNil(id) ? this.id : id;
      return /*#__PURE__*/React.createElement(Layer, {
        className: layerClass,
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null
      }, needClipX || needClipY ? /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
        id: "clipPath-".concat(clipPathId)
      }, /*#__PURE__*/React.createElement("rect", {
        x: needClipX ? left : left - width / 2,
        y: needClipY ? top : top - height / 2,
        width: needClipX ? width : width * 2,
        height: needClipY ? height : height * 2
      }))) : null, line && this.renderLine(), this.renderErrorBar(), /*#__PURE__*/React.createElement(Layer, {
        key: "recharts-scatter-symbols"
      }, this.renderSymbols()), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, points));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curPoints: nextProps.points,
          prevPoints: prevState.curPoints
        };
      }
      if (nextProps.points !== prevState.curPoints) {
        return {
          curPoints: nextProps.points
        };
      }
      return null;
    }
  }]);
}(PureComponent);
_Scatter = Scatter;
_defineProperty(Scatter, "displayName", 'Scatter');
_defineProperty(Scatter, "defaultProps", {
  xAxisId: 0,
  yAxisId: 0,
  zAxisId: 0,
  legendType: 'circle',
  lineType: 'joint',
  lineJointType: 'linear',
  data: [],
  shape: 'circle',
  hide: false,
  isAnimationActive: !Global.isSsr,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'linear'
});
/**
 * Compose the data of each group
 * @param  {Object} xAxis   The configuration of x-axis
 * @param  {Object} yAxis   The configuration of y-axis
 * @param  {String} dataKey The unique key of a group
 * @return {Array}  Composed data
 */
_defineProperty(Scatter, "getComposedData", function (_ref2) {
  var xAxis = _ref2.xAxis,
    yAxis = _ref2.yAxis,
    zAxis = _ref2.zAxis,
    item = _ref2.item,
    displayedData = _ref2.displayedData,
    xAxisTicks = _ref2.xAxisTicks,
    yAxisTicks = _ref2.yAxisTicks,
    offset = _ref2.offset;
  var tooltipType = item.props.tooltipType;
  var cells = findAllByType(item.props.children, Cell);
  var xAxisDataKey = isNil(xAxis.dataKey) ? item.props.dataKey : xAxis.dataKey;
  var yAxisDataKey = isNil(yAxis.dataKey) ? item.props.dataKey : yAxis.dataKey;
  var zAxisDataKey = zAxis && zAxis.dataKey;
  var defaultRangeZ = zAxis ? zAxis.range : ZAxis.defaultProps.range;
  var defaultZ = defaultRangeZ && defaultRangeZ[0];
  var xBandSize = xAxis.scale.bandwidth ? xAxis.scale.bandwidth() : 0;
  var yBandSize = yAxis.scale.bandwidth ? yAxis.scale.bandwidth() : 0;
  var points = displayedData.map(function (entry, index) {
    var x = getValueByDataKey(entry, xAxisDataKey);
    var y = getValueByDataKey(entry, yAxisDataKey);
    var z = !isNil(zAxisDataKey) && getValueByDataKey(entry, zAxisDataKey) || '-';
    var tooltipPayload = [{
      name: isNil(xAxis.dataKey) ? item.props.name : xAxis.name || xAxis.dataKey,
      unit: xAxis.unit || '',
      value: x,
      payload: entry,
      dataKey: xAxisDataKey,
      type: tooltipType
    }, {
      name: isNil(yAxis.dataKey) ? item.props.name : yAxis.name || yAxis.dataKey,
      unit: yAxis.unit || '',
      value: y,
      payload: entry,
      dataKey: yAxisDataKey,
      type: tooltipType
    }];
    if (z !== '-') {
      tooltipPayload.push({
        name: zAxis.name || zAxis.dataKey,
        unit: zAxis.unit || '',
        value: z,
        payload: entry,
        dataKey: zAxisDataKey,
        type: tooltipType
      });
    }
    var cx = getCateCoordinateOfLine({
      axis: xAxis,
      ticks: xAxisTicks,
      bandSize: xBandSize,
      entry: entry,
      index: index,
      dataKey: xAxisDataKey
    });
    var cy = getCateCoordinateOfLine({
      axis: yAxis,
      ticks: yAxisTicks,
      bandSize: yBandSize,
      entry: entry,
      index: index,
      dataKey: yAxisDataKey
    });
    var size = z !== '-' ? zAxis.scale(z) : defaultZ;
    var radius = Math.sqrt(Math.max(size, 0) / Math.PI);
    return _objectSpread(_objectSpread({}, entry), {}, {
      cx: cx,
      cy: cy,
      x: cx - radius,
      y: cy - radius,
      xAxis: xAxis,
      yAxis: yAxis,
      zAxis: zAxis,
      width: 2 * radius,
      height: 2 * radius,
      size: size,
      node: {
        x: x,
        y: y,
        z: z
      },
      tooltipPayload: tooltipPayload,
      tooltipPosition: {
        x: cx,
        y: cy
      },
      payload: entry
    }, cells && cells[index] && cells[index].props);
  });
  return _objectSpread({
    points: points
  }, offset);
});