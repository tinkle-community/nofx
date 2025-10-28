var _Funnel;
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
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
 * @fileOverview Render sectors of a funnel
 */
import React, { PureComponent } from 'react';
import Animate from 'react-smooth';
import isFunction from 'lodash/isFunction';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import clsx from 'clsx';
import { Layer } from '../container/Layer';
import { LabelList } from '../component/LabelList';
import { Cell } from '../component/Cell';
import { findAllByType, filterProps } from '../util/ReactUtils';
import { Global } from '../util/Global';
import { interpolateNumber } from '../util/DataUtils';
import { getValueByDataKey } from '../util/ChartUtils';
import { adaptEventsOfChild } from '../util/types';
import { FunnelTrapezoid } from '../util/FunnelUtils';
export var Funnel = /*#__PURE__*/function (_PureComponent) {
  function Funnel() {
    var _this;
    _classCallCheck(this, Funnel);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Funnel, [].concat(args));
    _defineProperty(_this, "state", {
      isAnimationFinished: false
    });
    _defineProperty(_this, "handleAnimationEnd", function () {
      var onAnimationEnd = _this.props.onAnimationEnd;
      _this.setState({
        isAnimationFinished: true
      });
      if (isFunction(onAnimationEnd)) {
        onAnimationEnd();
      }
    });
    _defineProperty(_this, "handleAnimationStart", function () {
      var onAnimationStart = _this.props.onAnimationStart;
      _this.setState({
        isAnimationFinished: false
      });
      if (isFunction(onAnimationStart)) {
        onAnimationStart();
      }
    });
    return _this;
  }
  _inherits(Funnel, _PureComponent);
  return _createClass(Funnel, [{
    key: "isActiveIndex",
    value: function isActiveIndex(i) {
      var activeIndex = this.props.activeIndex;
      if (Array.isArray(activeIndex)) {
        return activeIndex.indexOf(i) !== -1;
      }
      return i === activeIndex;
    }
  }, {
    key: "renderTrapezoidsStatically",
    value: function renderTrapezoidsStatically(trapezoids) {
      var _this2 = this;
      var _this$props = this.props,
        shape = _this$props.shape,
        activeShape = _this$props.activeShape;
      return trapezoids.map(function (entry, i) {
        var trapezoidOptions = _this2.isActiveIndex(i) ? activeShape : shape;
        var trapezoidProps = _objectSpread(_objectSpread({}, entry), {}, {
          isActive: _this2.isActiveIndex(i),
          stroke: entry.stroke
        });
        return /*#__PURE__*/React.createElement(Layer, _extends({
          className: "recharts-funnel-trapezoid"
        }, adaptEventsOfChild(_this2.props, entry, i), {
          key: "trapezoid-".concat(entry === null || entry === void 0 ? void 0 : entry.x, "-").concat(entry === null || entry === void 0 ? void 0 : entry.y, "-").concat(entry === null || entry === void 0 ? void 0 : entry.name, "-").concat(entry === null || entry === void 0 ? void 0 : entry.value),
          role: "img"
        }), /*#__PURE__*/React.createElement(FunnelTrapezoid, _extends({
          option: trapezoidOptions
        }, trapezoidProps)));
      });
    }
  }, {
    key: "renderTrapezoidsWithAnimation",
    value: function renderTrapezoidsWithAnimation() {
      var _this3 = this;
      var _this$props2 = this.props,
        trapezoids = _this$props2.trapezoids,
        isAnimationActive = _this$props2.isAnimationActive,
        animationBegin = _this$props2.animationBegin,
        animationDuration = _this$props2.animationDuration,
        animationEasing = _this$props2.animationEasing,
        animationId = _this$props2.animationId;
      var prevTrapezoids = this.state.prevTrapezoids;
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
        key: "funnel-".concat(animationId),
        onAnimationStart: this.handleAnimationStart,
        onAnimationEnd: this.handleAnimationEnd
      }, function (_ref) {
        var t = _ref.t;
        var stepData = trapezoids.map(function (entry, index) {
          var prev = prevTrapezoids && prevTrapezoids[index];
          if (prev) {
            var _interpolatorX = interpolateNumber(prev.x, entry.x);
            var _interpolatorY = interpolateNumber(prev.y, entry.y);
            var _interpolatorUpperWidth = interpolateNumber(prev.upperWidth, entry.upperWidth);
            var _interpolatorLowerWidth = interpolateNumber(prev.lowerWidth, entry.lowerWidth);
            var _interpolatorHeight = interpolateNumber(prev.height, entry.height);
            return _objectSpread(_objectSpread({}, entry), {}, {
              x: _interpolatorX(t),
              y: _interpolatorY(t),
              upperWidth: _interpolatorUpperWidth(t),
              lowerWidth: _interpolatorLowerWidth(t),
              height: _interpolatorHeight(t)
            });
          }
          var interpolatorX = interpolateNumber(entry.x + entry.upperWidth / 2, entry.x);
          var interpolatorY = interpolateNumber(entry.y + entry.height / 2, entry.y);
          var interpolatorUpperWidth = interpolateNumber(0, entry.upperWidth);
          var interpolatorLowerWidth = interpolateNumber(0, entry.lowerWidth);
          var interpolatorHeight = interpolateNumber(0, entry.height);
          return _objectSpread(_objectSpread({}, entry), {}, {
            x: interpolatorX(t),
            y: interpolatorY(t),
            upperWidth: interpolatorUpperWidth(t),
            lowerWidth: interpolatorLowerWidth(t),
            height: interpolatorHeight(t)
          });
        });
        return /*#__PURE__*/React.createElement(Layer, null, _this3.renderTrapezoidsStatically(stepData));
      });
    }
  }, {
    key: "renderTrapezoids",
    value: function renderTrapezoids() {
      var _this$props3 = this.props,
        trapezoids = _this$props3.trapezoids,
        isAnimationActive = _this$props3.isAnimationActive;
      var prevTrapezoids = this.state.prevTrapezoids;
      if (isAnimationActive && trapezoids && trapezoids.length && (!prevTrapezoids || !isEqual(prevTrapezoids, trapezoids))) {
        return this.renderTrapezoidsWithAnimation();
      }
      return this.renderTrapezoidsStatically(trapezoids);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
        hide = _this$props4.hide,
        trapezoids = _this$props4.trapezoids,
        className = _this$props4.className,
        isAnimationActive = _this$props4.isAnimationActive;
      var isAnimationFinished = this.state.isAnimationFinished;
      if (hide || !trapezoids || !trapezoids.length) {
        return null;
      }
      var layerClass = clsx('recharts-trapezoids', className);
      return /*#__PURE__*/React.createElement(Layer, {
        className: layerClass
      }, this.renderTrapezoids(), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, trapezoids));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curTrapezoids: nextProps.trapezoids,
          prevTrapezoids: prevState.curTrapezoids
        };
      }
      if (nextProps.trapezoids !== prevState.curTrapezoids) {
        return {
          curTrapezoids: nextProps.trapezoids
        };
      }
      return null;
    }
  }]);
}(PureComponent);
_Funnel = Funnel;
_defineProperty(Funnel, "displayName", 'Funnel');
_defineProperty(Funnel, "defaultProps", {
  stroke: '#fff',
  fill: '#808080',
  legendType: 'rect',
  labelLine: true,
  hide: false,
  isAnimationActive: !Global.isSsr,
  animationBegin: 400,
  animationDuration: 1500,
  animationEasing: 'ease',
  nameKey: 'name',
  lastShapeType: 'triangle'
});
_defineProperty(Funnel, "getRealFunnelData", function (item) {
  var _item$props = item.props,
    data = _item$props.data,
    children = _item$props.children;
  var presentationProps = filterProps(item.props, false);
  var cells = findAllByType(children, Cell);
  if (data && data.length) {
    return data.map(function (entry, index) {
      return _objectSpread(_objectSpread(_objectSpread({
        payload: entry
      }, presentationProps), entry), cells && cells[index] && cells[index].props);
    });
  }
  if (cells && cells.length) {
    return cells.map(function (cell) {
      return _objectSpread(_objectSpread({}, presentationProps), cell.props);
    });
  }
  return [];
});
_defineProperty(Funnel, "getRealWidthHeight", function (item, offset) {
  var customWidth = item.props.width;
  var width = offset.width,
    height = offset.height,
    left = offset.left,
    right = offset.right,
    top = offset.top,
    bottom = offset.bottom;
  var realHeight = height;
  var realWidth = width;
  if (isNumber(customWidth)) {
    realWidth = customWidth;
  } else if (isString(customWidth)) {
    realWidth = realWidth * parseFloat(customWidth) / 100;
  }
  return {
    realWidth: realWidth - left - right - 50,
    realHeight: realHeight - bottom - top,
    offsetX: (width - realWidth) / 2,
    offsetY: (height - realHeight) / 2
  };
});
_defineProperty(Funnel, "getComposedData", function (_ref2) {
  var item = _ref2.item,
    offset = _ref2.offset;
  var funnelData = _Funnel.getRealFunnelData(item);
  var _item$props2 = item.props,
    dataKey = _item$props2.dataKey,
    nameKey = _item$props2.nameKey,
    tooltipType = _item$props2.tooltipType,
    lastShapeType = _item$props2.lastShapeType,
    reversed = _item$props2.reversed;
  var left = offset.left,
    top = offset.top;
  var _Funnel$getRealWidthH = _Funnel.getRealWidthHeight(item, offset),
    realHeight = _Funnel$getRealWidthH.realHeight,
    realWidth = _Funnel$getRealWidthH.realWidth,
    offsetX = _Funnel$getRealWidthH.offsetX,
    offsetY = _Funnel$getRealWidthH.offsetY;
  var maxValue = Math.max.apply(null, funnelData.map(function (entry) {
    return getValueByDataKey(entry, dataKey, 0);
  }));
  var len = funnelData.length;
  var rowHeight = realHeight / len;
  var parentViewBox = {
    x: offset.left,
    y: offset.top,
    width: offset.width,
    height: offset.height
  };
  var trapezoids = funnelData.map(function (entry, i) {
    var rawVal = getValueByDataKey(entry, dataKey, 0);
    var name = getValueByDataKey(entry, nameKey, i);
    var val = rawVal;
    var nextVal;
    if (i !== len - 1) {
      nextVal = getValueByDataKey(funnelData[i + 1], dataKey, 0);
      if (nextVal instanceof Array) {
        var _nextVal = nextVal;
        var _nextVal2 = _slicedToArray(_nextVal, 1);
        nextVal = _nextVal2[0];
      }
    } else if (rawVal instanceof Array && rawVal.length === 2) {
      var _rawVal = _slicedToArray(rawVal, 2);
      val = _rawVal[0];
      nextVal = _rawVal[1];
    } else if (lastShapeType === 'rectangle') {
      nextVal = val;
    } else {
      nextVal = 0;
    }
    var x = (maxValue - val) * realWidth / (2 * maxValue) + top + 25 + offsetX;
    var y = rowHeight * i + left + offsetY;
    var upperWidth = val / maxValue * realWidth;
    var lowerWidth = nextVal / maxValue * realWidth;
    var tooltipPayload = [{
      name: name,
      value: val,
      payload: entry,
      dataKey: dataKey,
      type: tooltipType
    }];
    var tooltipPosition = {
      x: x + upperWidth / 2,
      y: y + rowHeight / 2
    };
    return _objectSpread(_objectSpread({
      x: x,
      y: y,
      width: Math.max(upperWidth, lowerWidth),
      upperWidth: upperWidth,
      lowerWidth: lowerWidth,
      height: rowHeight,
      name: name,
      val: val,
      tooltipPayload: tooltipPayload,
      tooltipPosition: tooltipPosition
    }, omit(entry, 'width')), {}, {
      payload: entry,
      parentViewBox: parentViewBox,
      labelViewBox: {
        x: x + (upperWidth - lowerWidth) / 4,
        y: y,
        width: Math.abs(upperWidth - lowerWidth) / 2 + Math.min(upperWidth, lowerWidth),
        height: rowHeight
      }
    });
  });
  if (reversed) {
    trapezoids = trapezoids.map(function (entry, index) {
      var newY = entry.y - index * rowHeight + (len - 1 - index) * rowHeight;
      return _objectSpread(_objectSpread({}, entry), {}, {
        upperWidth: entry.lowerWidth,
        lowerWidth: entry.upperWidth,
        x: entry.x - (entry.lowerWidth - entry.upperWidth) / 2,
        y: entry.y - index * rowHeight + (len - 1 - index) * rowHeight,
        tooltipPosition: _objectSpread(_objectSpread({}, entry.tooltipPosition), {}, {
          y: newY + rowHeight / 2
        }),
        labelViewBox: _objectSpread(_objectSpread({}, entry.labelViewBox), {}, {
          y: newY
        })
      });
    });
  }
  return {
    trapezoids: trapezoids,
    data: funnelData
  };
});