"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolarRadiusAxis = void 0;
var _react = _interopRequireWildcard(require("react"));
var _maxBy = _interopRequireDefault(require("lodash/maxBy"));
var _minBy = _interopRequireDefault(require("lodash/minBy"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _clsx = _interopRequireDefault(require("clsx"));
var _Text = require("../component/Text");
var _Label = require("../component/Label");
var _Layer = require("../container/Layer");
var _PolarUtils = require("../util/PolarUtils");
var _types = require("../util/types");
var _ReactUtils = require("../util/ReactUtils");
var _excluded = ["cx", "cy", "angle", "ticks", "axisLine"],
  _excluded2 = ["ticks", "tick", "angle", "tickFormatter", "stroke"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
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
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * @fileOverview The axis of polar coordinate system
 */
var PolarRadiusAxis = exports.PolarRadiusAxis = /*#__PURE__*/function (_PureComponent) {
  function PolarRadiusAxis() {
    _classCallCheck(this, PolarRadiusAxis);
    return _callSuper(this, PolarRadiusAxis, arguments);
  }
  _inherits(PolarRadiusAxis, _PureComponent);
  return _createClass(PolarRadiusAxis, [{
    key: "getTickValueCoord",
    value:
    /**
     * Calculate the coordinate of tick
     * @param  {Number} coordinate The radius of tick
     * @return {Object} (x, y)
     */
    function getTickValueCoord(_ref) {
      var coordinate = _ref.coordinate;
      var _this$props = this.props,
        angle = _this$props.angle,
        cx = _this$props.cx,
        cy = _this$props.cy;
      return (0, _PolarUtils.polarToCartesian)(cx, cy, coordinate, angle);
    }
  }, {
    key: "getTickTextAnchor",
    value: function getTickTextAnchor() {
      var orientation = this.props.orientation;
      var textAnchor;
      switch (orientation) {
        case 'left':
          textAnchor = 'end';
          break;
        case 'right':
          textAnchor = 'start';
          break;
        default:
          textAnchor = 'middle';
          break;
      }
      return textAnchor;
    }
  }, {
    key: "getViewBox",
    value: function getViewBox() {
      var _this$props2 = this.props,
        cx = _this$props2.cx,
        cy = _this$props2.cy,
        angle = _this$props2.angle,
        ticks = _this$props2.ticks;
      var maxRadiusTick = (0, _maxBy["default"])(ticks, function (entry) {
        return entry.coordinate || 0;
      });
      var minRadiusTick = (0, _minBy["default"])(ticks, function (entry) {
        return entry.coordinate || 0;
      });
      return {
        cx: cx,
        cy: cy,
        startAngle: angle,
        endAngle: angle,
        innerRadius: minRadiusTick.coordinate || 0,
        outerRadius: maxRadiusTick.coordinate || 0
      };
    }
  }, {
    key: "renderAxisLine",
    value: function renderAxisLine() {
      var _this$props3 = this.props,
        cx = _this$props3.cx,
        cy = _this$props3.cy,
        angle = _this$props3.angle,
        ticks = _this$props3.ticks,
        axisLine = _this$props3.axisLine,
        others = _objectWithoutProperties(_this$props3, _excluded);
      var extent = ticks.reduce(function (result, entry) {
        return [Math.min(result[0], entry.coordinate), Math.max(result[1], entry.coordinate)];
      }, [Infinity, -Infinity]);
      var point0 = (0, _PolarUtils.polarToCartesian)(cx, cy, extent[0], angle);
      var point1 = (0, _PolarUtils.polarToCartesian)(cx, cy, extent[1], angle);
      var props = _objectSpread(_objectSpread(_objectSpread({}, (0, _ReactUtils.filterProps)(others, false)), {}, {
        fill: 'none'
      }, (0, _ReactUtils.filterProps)(axisLine, false)), {}, {
        x1: point0.x,
        y1: point0.y,
        x2: point1.x,
        y2: point1.y
      });
      return /*#__PURE__*/_react["default"].createElement("line", _extends({
        className: "recharts-polar-radius-axis-line"
      }, props));
    }
  }, {
    key: "renderTicks",
    value: function renderTicks() {
      var _this = this;
      var _this$props4 = this.props,
        ticks = _this$props4.ticks,
        tick = _this$props4.tick,
        angle = _this$props4.angle,
        tickFormatter = _this$props4.tickFormatter,
        stroke = _this$props4.stroke,
        others = _objectWithoutProperties(_this$props4, _excluded2);
      var textAnchor = this.getTickTextAnchor();
      var axisProps = (0, _ReactUtils.filterProps)(others, false);
      var customTickProps = (0, _ReactUtils.filterProps)(tick, false);
      var items = ticks.map(function (entry, i) {
        var coord = _this.getTickValueCoord(entry);
        var tickProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({
          textAnchor: textAnchor,
          transform: "rotate(".concat(90 - angle, ", ").concat(coord.x, ", ").concat(coord.y, ")")
        }, axisProps), {}, {
          stroke: 'none',
          fill: stroke
        }, customTickProps), {}, {
          index: i
        }, coord), {}, {
          payload: entry
        });
        return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, _extends({
          className: (0, _clsx["default"])('recharts-polar-radius-axis-tick', (0, _PolarUtils.getTickClassName)(tick)),
          key: "tick-".concat(entry.coordinate)
        }, (0, _types.adaptEventsOfChild)(_this.props, entry, i)), PolarRadiusAxis.renderTickItem(tick, tickProps, tickFormatter ? tickFormatter(entry.value, i) : entry.value));
      });
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: "recharts-polar-radius-axis-ticks"
      }, items);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props5 = this.props,
        ticks = _this$props5.ticks,
        axisLine = _this$props5.axisLine,
        tick = _this$props5.tick;
      if (!ticks || !ticks.length) {
        return null;
      }
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: (0, _clsx["default"])('recharts-polar-radius-axis', this.props.className)
      }, axisLine && this.renderAxisLine(), tick && this.renderTicks(), _Label.Label.renderCallByParent(this.props, this.getViewBox()));
    }
  }], [{
    key: "renderTickItem",
    value: function renderTickItem(option, props, value) {
      var tickItem;
      if ( /*#__PURE__*/_react["default"].isValidElement(option)) {
        tickItem = /*#__PURE__*/_react["default"].cloneElement(option, props);
      } else if ((0, _isFunction["default"])(option)) {
        tickItem = option(props);
      } else {
        tickItem = /*#__PURE__*/_react["default"].createElement(_Text.Text, _extends({}, props, {
          className: "recharts-polar-radius-axis-tick-value"
        }), value);
      }
      return tickItem;
    }
  }]);
}(_react.PureComponent);
_defineProperty(PolarRadiusAxis, "displayName", 'PolarRadiusAxis');
_defineProperty(PolarRadiusAxis, "axisType", 'radiusAxis');
_defineProperty(PolarRadiusAxis, "defaultProps", {
  type: 'number',
  radiusAxisId: 0,
  cx: 0,
  cy: 0,
  angle: 0,
  orientation: 'right',
  stroke: '#ccc',
  axisLine: true,
  tick: true,
  tickCount: 5,
  allowDataOverflow: false,
  scale: 'auto',
  allowDuplicatedCategory: true
});