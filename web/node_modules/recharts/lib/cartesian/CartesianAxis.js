"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CartesianAxis = void 0;
var _react = _interopRequireWildcard(require("react"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _get = _interopRequireDefault(require("lodash/get"));
var _clsx = _interopRequireDefault(require("clsx"));
var _ShallowEqual = require("../util/ShallowEqual");
var _Layer = require("../container/Layer");
var _Text = require("../component/Text");
var _Label = require("../component/Label");
var _DataUtils = require("../util/DataUtils");
var _types = require("../util/types");
var _ReactUtils = require("../util/ReactUtils");
var _getTicks = require("./getTicks");
var _excluded = ["viewBox"],
  _excluded2 = ["viewBox"],
  _excluded3 = ["ticks"];
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
 * @fileOverview Cartesian Axis
 */
/** The orientation of the axis in correspondence to the chart */
/** A unit to be appended to a value */
/** The formatter function of tick */
var CartesianAxis = exports.CartesianAxis = /*#__PURE__*/function (_Component) {
  function CartesianAxis(props) {
    var _this;
    _classCallCheck(this, CartesianAxis);
    _this = _callSuper(this, CartesianAxis, [props]);
    _this.state = {
      fontSize: '',
      letterSpacing: ''
    };
    return _this;
  }
  _inherits(CartesianAxis, _Component);
  return _createClass(CartesianAxis, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(_ref, nextState) {
      var viewBox = _ref.viewBox,
        restProps = _objectWithoutProperties(_ref, _excluded);
      // props.viewBox is sometimes generated every time -
      // check that specially as object equality is likely to fail
      var _this$props = this.props,
        viewBoxOld = _this$props.viewBox,
        restPropsOld = _objectWithoutProperties(_this$props, _excluded2);
      return !(0, _ShallowEqual.shallowEqual)(viewBox, viewBoxOld) || !(0, _ShallowEqual.shallowEqual)(restProps, restPropsOld) || !(0, _ShallowEqual.shallowEqual)(nextState, this.state);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var htmlLayer = this.layerReference;
      if (!htmlLayer) return;
      var tick = htmlLayer.getElementsByClassName('recharts-cartesian-axis-tick-value')[0];
      if (tick) {
        this.setState({
          fontSize: window.getComputedStyle(tick).fontSize,
          letterSpacing: window.getComputedStyle(tick).letterSpacing
        });
      }
    }

    /**
     * Calculate the coordinates of endpoints in ticks
     * @param  {Object} data The data of a simple tick
     * @return {Object} (x1, y1): The coordinate of endpoint close to tick text
     *  (x2, y2): The coordinate of endpoint close to axis
     */
  }, {
    key: "getTickLineCoord",
    value: function getTickLineCoord(data) {
      var _this$props2 = this.props,
        x = _this$props2.x,
        y = _this$props2.y,
        width = _this$props2.width,
        height = _this$props2.height,
        orientation = _this$props2.orientation,
        tickSize = _this$props2.tickSize,
        mirror = _this$props2.mirror,
        tickMargin = _this$props2.tickMargin;
      var x1, x2, y1, y2, tx, ty;
      var sign = mirror ? -1 : 1;
      var finalTickSize = data.tickSize || tickSize;
      var tickCoord = (0, _DataUtils.isNumber)(data.tickCoord) ? data.tickCoord : data.coordinate;
      switch (orientation) {
        case 'top':
          x1 = x2 = data.coordinate;
          y2 = y + +!mirror * height;
          y1 = y2 - sign * finalTickSize;
          ty = y1 - sign * tickMargin;
          tx = tickCoord;
          break;
        case 'left':
          y1 = y2 = data.coordinate;
          x2 = x + +!mirror * width;
          x1 = x2 - sign * finalTickSize;
          tx = x1 - sign * tickMargin;
          ty = tickCoord;
          break;
        case 'right':
          y1 = y2 = data.coordinate;
          x2 = x + +mirror * width;
          x1 = x2 + sign * finalTickSize;
          tx = x1 + sign * tickMargin;
          ty = tickCoord;
          break;
        default:
          x1 = x2 = data.coordinate;
          y2 = y + +mirror * height;
          y1 = y2 + sign * finalTickSize;
          ty = y1 + sign * tickMargin;
          tx = tickCoord;
          break;
      }
      return {
        line: {
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        },
        tick: {
          x: tx,
          y: ty
        }
      };
    }
  }, {
    key: "getTickTextAnchor",
    value: function getTickTextAnchor() {
      var _this$props3 = this.props,
        orientation = _this$props3.orientation,
        mirror = _this$props3.mirror;
      var textAnchor;
      switch (orientation) {
        case 'left':
          textAnchor = mirror ? 'start' : 'end';
          break;
        case 'right':
          textAnchor = mirror ? 'end' : 'start';
          break;
        default:
          textAnchor = 'middle';
          break;
      }
      return textAnchor;
    }
  }, {
    key: "getTickVerticalAnchor",
    value: function getTickVerticalAnchor() {
      var _this$props4 = this.props,
        orientation = _this$props4.orientation,
        mirror = _this$props4.mirror;
      var verticalAnchor = 'end';
      switch (orientation) {
        case 'left':
        case 'right':
          verticalAnchor = 'middle';
          break;
        case 'top':
          verticalAnchor = mirror ? 'start' : 'end';
          break;
        default:
          verticalAnchor = mirror ? 'end' : 'start';
          break;
      }
      return verticalAnchor;
    }
  }, {
    key: "renderAxisLine",
    value: function renderAxisLine() {
      var _this$props5 = this.props,
        x = _this$props5.x,
        y = _this$props5.y,
        width = _this$props5.width,
        height = _this$props5.height,
        orientation = _this$props5.orientation,
        mirror = _this$props5.mirror,
        axisLine = _this$props5.axisLine;
      var props = _objectSpread(_objectSpread(_objectSpread({}, (0, _ReactUtils.filterProps)(this.props, false)), (0, _ReactUtils.filterProps)(axisLine, false)), {}, {
        fill: 'none'
      });
      if (orientation === 'top' || orientation === 'bottom') {
        var needHeight = +(orientation === 'top' && !mirror || orientation === 'bottom' && mirror);
        props = _objectSpread(_objectSpread({}, props), {}, {
          x1: x,
          y1: y + needHeight * height,
          x2: x + width,
          y2: y + needHeight * height
        });
      } else {
        var needWidth = +(orientation === 'left' && !mirror || orientation === 'right' && mirror);
        props = _objectSpread(_objectSpread({}, props), {}, {
          x1: x + needWidth * width,
          y1: y,
          x2: x + needWidth * width,
          y2: y + height
        });
      }
      return /*#__PURE__*/_react["default"].createElement("line", _extends({}, props, {
        className: (0, _clsx["default"])('recharts-cartesian-axis-line', (0, _get["default"])(axisLine, 'className'))
      }));
    }
  }, {
    key: "renderTicks",
    value:
    /**
     * render the ticks
     * @param {Array} ticks The ticks to actually render (overrides what was passed in props)
     * @param {string} fontSize Fontsize to consider for tick spacing
     * @param {string} letterSpacing Letterspacing to consider for tick spacing
     * @return {ReactComponent} renderedTicks
     */
    function renderTicks(ticks, fontSize, letterSpacing) {
      var _this2 = this;
      var _this$props6 = this.props,
        tickLine = _this$props6.tickLine,
        stroke = _this$props6.stroke,
        tick = _this$props6.tick,
        tickFormatter = _this$props6.tickFormatter,
        unit = _this$props6.unit;
      var finalTicks = (0, _getTicks.getTicks)(_objectSpread(_objectSpread({}, this.props), {}, {
        ticks: ticks
      }), fontSize, letterSpacing);
      var textAnchor = this.getTickTextAnchor();
      var verticalAnchor = this.getTickVerticalAnchor();
      var axisProps = (0, _ReactUtils.filterProps)(this.props, false);
      var customTickProps = (0, _ReactUtils.filterProps)(tick, false);
      var tickLineProps = _objectSpread(_objectSpread({}, axisProps), {}, {
        fill: 'none'
      }, (0, _ReactUtils.filterProps)(tickLine, false));
      var items = finalTicks.map(function (entry, i) {
        var _this2$getTickLineCoo = _this2.getTickLineCoord(entry),
          lineCoord = _this2$getTickLineCoo.line,
          tickCoord = _this2$getTickLineCoo.tick;
        var tickProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({
          textAnchor: textAnchor,
          verticalAnchor: verticalAnchor
        }, axisProps), {}, {
          stroke: 'none',
          fill: stroke
        }, customTickProps), tickCoord), {}, {
          index: i,
          payload: entry,
          visibleTicksCount: finalTicks.length,
          tickFormatter: tickFormatter
        });
        return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, _extends({
          className: "recharts-cartesian-axis-tick",
          key: "tick-".concat(entry.value, "-").concat(entry.coordinate, "-").concat(entry.tickCoord)
        }, (0, _types.adaptEventsOfChild)(_this2.props, entry, i)), tickLine && /*#__PURE__*/_react["default"].createElement("line", _extends({}, tickLineProps, lineCoord, {
          className: (0, _clsx["default"])('recharts-cartesian-axis-tick-line', (0, _get["default"])(tickLine, 'className'))
        })), tick && CartesianAxis.renderTickItem(tick, tickProps, "".concat((0, _isFunction["default"])(tickFormatter) ? tickFormatter(entry.value, i) : entry.value).concat(unit || '')));
      });
      return /*#__PURE__*/_react["default"].createElement("g", {
        className: "recharts-cartesian-axis-ticks"
      }, items);
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;
      var _this$props7 = this.props,
        axisLine = _this$props7.axisLine,
        width = _this$props7.width,
        height = _this$props7.height,
        ticksGenerator = _this$props7.ticksGenerator,
        className = _this$props7.className,
        hide = _this$props7.hide;
      if (hide) {
        return null;
      }
      var _this$props8 = this.props,
        ticks = _this$props8.ticks,
        noTicksProps = _objectWithoutProperties(_this$props8, _excluded3);
      var finalTicks = ticks;
      if ((0, _isFunction["default"])(ticksGenerator)) {
        finalTicks = ticks && ticks.length > 0 ? ticksGenerator(this.props) : ticksGenerator(noTicksProps);
      }
      if (width <= 0 || height <= 0 || !finalTicks || !finalTicks.length) {
        return null;
      }
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: (0, _clsx["default"])('recharts-cartesian-axis', className),
        ref: function ref(_ref2) {
          _this3.layerReference = _ref2;
        }
      }, axisLine && this.renderAxisLine(), this.renderTicks(finalTicks, this.state.fontSize, this.state.letterSpacing), _Label.Label.renderCallByParent(this.props));
    }
  }], [{
    key: "renderTickItem",
    value: function renderTickItem(option, props, value) {
      var tickItem;
      var combinedClassName = (0, _clsx["default"])(props.className, 'recharts-cartesian-axis-tick-value');
      if ( /*#__PURE__*/_react["default"].isValidElement(option)) {
        tickItem = /*#__PURE__*/_react["default"].cloneElement(option, _objectSpread(_objectSpread({}, props), {}, {
          className: combinedClassName
        }));
      } else if ((0, _isFunction["default"])(option)) {
        tickItem = option(_objectSpread(_objectSpread({}, props), {}, {
          className: combinedClassName
        }));
      } else {
        tickItem = /*#__PURE__*/_react["default"].createElement(_Text.Text, _extends({}, props, {
          className: "recharts-cartesian-axis-tick-value"
        }), value);
      }
      return tickItem;
    }
  }]);
}(_react.Component);
_defineProperty(CartesianAxis, "displayName", 'CartesianAxis');
_defineProperty(CartesianAxis, "defaultProps", {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  viewBox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  // The orientation of axis
  orientation: 'bottom',
  // The ticks
  ticks: [],
  stroke: '#666',
  tickLine: true,
  axisLine: true,
  tick: true,
  mirror: false,
  minTickGap: 5,
  // The width or height of tick
  tickSize: 6,
  tickMargin: 2,
  interval: 'preserveEnd'
});