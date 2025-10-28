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
 * @fileOverview Axis of radial direction
 */
import React, { PureComponent } from 'react';
import isFunction from 'lodash/isFunction';
import clsx from 'clsx';
import { Layer } from '../container/Layer';
import { Dot } from '../shape/Dot';
import { Polygon } from '../shape/Polygon';
import { Text } from '../component/Text';
import { adaptEventsOfChild } from '../util/types';
import { filterProps } from '../util/ReactUtils';
import { getTickClassName, polarToCartesian } from '../util/PolarUtils';
var RADIAN = Math.PI / 180;
var eps = 1e-5;
export var PolarAngleAxis = /*#__PURE__*/function (_PureComponent) {
  function PolarAngleAxis() {
    _classCallCheck(this, PolarAngleAxis);
    return _callSuper(this, PolarAngleAxis, arguments);
  }
  _inherits(PolarAngleAxis, _PureComponent);
  return _createClass(PolarAngleAxis, [{
    key: "getTickLineCoord",
    value:
    /**
     * Calculate the coordinate of line endpoint
     * @param  {Object} data The Data if ticks
     * @return {Object} (x0, y0): The start point of text,
     *                  (x1, y1): The end point close to text,
     *                  (x2, y2): The end point close to axis
     */
    function getTickLineCoord(data) {
      var _this$props = this.props,
        cx = _this$props.cx,
        cy = _this$props.cy,
        radius = _this$props.radius,
        orientation = _this$props.orientation,
        tickSize = _this$props.tickSize;
      var tickLineSize = tickSize || 8;
      var p1 = polarToCartesian(cx, cy, radius, data.coordinate);
      var p2 = polarToCartesian(cx, cy, radius + (orientation === 'inner' ? -1 : 1) * tickLineSize, data.coordinate);
      return {
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y
      };
    }

    /**
     * Get the text-anchor of each tick
     * @param  {Object} data Data of ticks
     * @return {String} text-anchor
     */
  }, {
    key: "getTickTextAnchor",
    value: function getTickTextAnchor(data) {
      var orientation = this.props.orientation;
      var cos = Math.cos(-data.coordinate * RADIAN);
      var textAnchor;
      if (cos > eps) {
        textAnchor = orientation === 'outer' ? 'start' : 'end';
      } else if (cos < -eps) {
        textAnchor = orientation === 'outer' ? 'end' : 'start';
      } else {
        textAnchor = 'middle';
      }
      return textAnchor;
    }
  }, {
    key: "renderAxisLine",
    value: function renderAxisLine() {
      var _this$props2 = this.props,
        cx = _this$props2.cx,
        cy = _this$props2.cy,
        radius = _this$props2.radius,
        axisLine = _this$props2.axisLine,
        axisLineType = _this$props2.axisLineType;
      var props = _objectSpread(_objectSpread({}, filterProps(this.props, false)), {}, {
        fill: 'none'
      }, filterProps(axisLine, false));
      if (axisLineType === 'circle') {
        return /*#__PURE__*/React.createElement(Dot, _extends({
          className: "recharts-polar-angle-axis-line"
        }, props, {
          cx: cx,
          cy: cy,
          r: radius
        }));
      }
      var ticks = this.props.ticks;
      var points = ticks.map(function (entry) {
        return polarToCartesian(cx, cy, radius, entry.coordinate);
      });
      return /*#__PURE__*/React.createElement(Polygon, _extends({
        className: "recharts-polar-angle-axis-line"
      }, props, {
        points: points
      }));
    }
  }, {
    key: "renderTicks",
    value: function renderTicks() {
      var _this = this;
      var _this$props3 = this.props,
        ticks = _this$props3.ticks,
        tick = _this$props3.tick,
        tickLine = _this$props3.tickLine,
        tickFormatter = _this$props3.tickFormatter,
        stroke = _this$props3.stroke;
      var axisProps = filterProps(this.props, false);
      var customTickProps = filterProps(tick, false);
      var tickLineProps = _objectSpread(_objectSpread({}, axisProps), {}, {
        fill: 'none'
      }, filterProps(tickLine, false));
      var items = ticks.map(function (entry, i) {
        var lineCoord = _this.getTickLineCoord(entry);
        var textAnchor = _this.getTickTextAnchor(entry);
        var tickProps = _objectSpread(_objectSpread(_objectSpread({
          textAnchor: textAnchor
        }, axisProps), {}, {
          stroke: 'none',
          fill: stroke
        }, customTickProps), {}, {
          index: i,
          payload: entry,
          x: lineCoord.x2,
          y: lineCoord.y2
        });
        return /*#__PURE__*/React.createElement(Layer, _extends({
          className: clsx('recharts-polar-angle-axis-tick', getTickClassName(tick)),
          key: "tick-".concat(entry.coordinate)
        }, adaptEventsOfChild(_this.props, entry, i)), tickLine && /*#__PURE__*/React.createElement("line", _extends({
          className: "recharts-polar-angle-axis-tick-line"
        }, tickLineProps, lineCoord)), tick && PolarAngleAxis.renderTickItem(tick, tickProps, tickFormatter ? tickFormatter(entry.value, i) : entry.value));
      });
      return /*#__PURE__*/React.createElement(Layer, {
        className: "recharts-polar-angle-axis-ticks"
      }, items);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
        ticks = _this$props4.ticks,
        radius = _this$props4.radius,
        axisLine = _this$props4.axisLine;
      if (radius <= 0 || !ticks || !ticks.length) {
        return null;
      }
      return /*#__PURE__*/React.createElement(Layer, {
        className: clsx('recharts-polar-angle-axis', this.props.className)
      }, axisLine && this.renderAxisLine(), this.renderTicks());
    }
  }], [{
    key: "renderTickItem",
    value: function renderTickItem(option, props, value) {
      var tickItem;
      if ( /*#__PURE__*/React.isValidElement(option)) {
        tickItem = /*#__PURE__*/React.cloneElement(option, props);
      } else if (isFunction(option)) {
        tickItem = option(props);
      } else {
        tickItem = /*#__PURE__*/React.createElement(Text, _extends({}, props, {
          className: "recharts-polar-angle-axis-tick-value"
        }), value);
      }
      return tickItem;
    }
  }]);
}(PureComponent);
_defineProperty(PolarAngleAxis, "displayName", 'PolarAngleAxis');
_defineProperty(PolarAngleAxis, "axisType", 'angleAxis');
_defineProperty(PolarAngleAxis, "defaultProps", {
  type: 'category',
  angleAxisId: 0,
  scale: 'auto',
  cx: 0,
  cy: 0,
  orientation: 'outer',
  axisLine: true,
  tickLine: true,
  tickSize: 8,
  tick: true,
  hide: false,
  allowDuplicatedCategory: true
});