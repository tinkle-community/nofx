"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultLegendContent = void 0;
var _react = _interopRequireWildcard(require("react"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _clsx2 = _interopRequireDefault(require("clsx"));
var _LogUtils = require("../util/LogUtils");
var _Surface = require("../container/Surface");
var _Symbols = require("../shape/Symbols");
var _types = require("../util/types");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * @fileOverview Default Legend Content
 */
var SIZE = 32;
var DefaultLegendContent = exports.DefaultLegendContent = /*#__PURE__*/function (_PureComponent) {
  function DefaultLegendContent() {
    _classCallCheck(this, DefaultLegendContent);
    return _callSuper(this, DefaultLegendContent, arguments);
  }
  _inherits(DefaultLegendContent, _PureComponent);
  return _createClass(DefaultLegendContent, [{
    key: "renderIcon",
    value:
    /**
     * Render the path of icon
     * @param {Object} data Data of each legend item
     * @return {String} Path element
     */
    function renderIcon(data) {
      var inactiveColor = this.props.inactiveColor;
      var halfSize = SIZE / 2;
      var sixthSize = SIZE / 6;
      var thirdSize = SIZE / 3;
      var color = data.inactive ? inactiveColor : data.color;
      if (data.type === 'plainline') {
        return /*#__PURE__*/_react["default"].createElement("line", {
          strokeWidth: 4,
          fill: "none",
          stroke: color,
          strokeDasharray: data.payload.strokeDasharray,
          x1: 0,
          y1: halfSize,
          x2: SIZE,
          y2: halfSize,
          className: "recharts-legend-icon"
        });
      }
      if (data.type === 'line') {
        return /*#__PURE__*/_react["default"].createElement("path", {
          strokeWidth: 4,
          fill: "none",
          stroke: color,
          d: "M0,".concat(halfSize, "h").concat(thirdSize, "\n            A").concat(sixthSize, ",").concat(sixthSize, ",0,1,1,").concat(2 * thirdSize, ",").concat(halfSize, "\n            H").concat(SIZE, "M").concat(2 * thirdSize, ",").concat(halfSize, "\n            A").concat(sixthSize, ",").concat(sixthSize, ",0,1,1,").concat(thirdSize, ",").concat(halfSize),
          className: "recharts-legend-icon"
        });
      }
      if (data.type === 'rect') {
        return /*#__PURE__*/_react["default"].createElement("path", {
          stroke: "none",
          fill: color,
          d: "M0,".concat(SIZE / 8, "h").concat(SIZE, "v").concat(SIZE * 3 / 4, "h").concat(-SIZE, "z"),
          className: "recharts-legend-icon"
        });
      }
      if ( /*#__PURE__*/_react["default"].isValidElement(data.legendIcon)) {
        var iconProps = _objectSpread({}, data);
        delete iconProps.legendIcon;
        return /*#__PURE__*/_react["default"].cloneElement(data.legendIcon, iconProps);
      }
      return /*#__PURE__*/_react["default"].createElement(_Symbols.Symbols, {
        fill: color,
        cx: halfSize,
        cy: halfSize,
        size: SIZE,
        sizeType: "diameter",
        type: data.type
      });
    }

    /**
     * Draw items of legend
     * @return {ReactElement} Items
     */
  }, {
    key: "renderItems",
    value: function renderItems() {
      var _this = this;
      var _this$props = this.props,
        payload = _this$props.payload,
        iconSize = _this$props.iconSize,
        layout = _this$props.layout,
        formatter = _this$props.formatter,
        inactiveColor = _this$props.inactiveColor;
      var viewBox = {
        x: 0,
        y: 0,
        width: SIZE,
        height: SIZE
      };
      var itemStyle = {
        display: layout === 'horizontal' ? 'inline-block' : 'block',
        marginRight: 10
      };
      var svgStyle = {
        display: 'inline-block',
        verticalAlign: 'middle',
        marginRight: 4
      };
      return payload.map(function (entry, i) {
        var finalFormatter = entry.formatter || formatter;
        var className = (0, _clsx2["default"])(_defineProperty(_defineProperty({
          'recharts-legend-item': true
        }, "legend-item-".concat(i), true), "inactive", entry.inactive));
        if (entry.type === 'none') {
          return null;
        }

        // Do not render entry.value as functions. Always require static string properties.
        var entryValue = !(0, _isFunction["default"])(entry.value) ? entry.value : null;
        (0, _LogUtils.warn)(!(0, _isFunction["default"])(entry.value), "The name property is also required when using a function for the dataKey of a chart's cartesian components. Ex: <Bar name=\"Name of my Data\"/>" // eslint-disable-line max-len
        );
        var color = entry.inactive ? inactiveColor : entry.color;
        return /*#__PURE__*/_react["default"].createElement("li", _extends({
          className: className,
          style: itemStyle
          // eslint-disable-next-line react/no-array-index-key
          ,
          key: "legend-item-".concat(i)
        }, (0, _types.adaptEventsOfChild)(_this.props, entry, i)), /*#__PURE__*/_react["default"].createElement(_Surface.Surface, {
          width: iconSize,
          height: iconSize,
          viewBox: viewBox,
          style: svgStyle
        }, _this.renderIcon(entry)), /*#__PURE__*/_react["default"].createElement("span", {
          className: "recharts-legend-item-text",
          style: {
            color: color
          }
        }, finalFormatter ? finalFormatter(entryValue, entry, i) : entryValue));
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
        payload = _this$props2.payload,
        layout = _this$props2.layout,
        align = _this$props2.align;
      if (!payload || !payload.length) {
        return null;
      }
      var finalStyle = {
        padding: 0,
        margin: 0,
        textAlign: layout === 'horizontal' ? align : 'left'
      };
      return /*#__PURE__*/_react["default"].createElement("ul", {
        className: "recharts-default-legend",
        style: finalStyle
      }, this.renderItems());
    }
  }]);
}(_react.PureComponent);
_defineProperty(DefaultLegendContent, "displayName", 'Legend');
_defineProperty(DefaultLegendContent, "defaultProps", {
  iconSize: 14,
  layout: 'horizontal',
  align: 'center',
  verticalAlign: 'middle',
  inactiveColor: '#ccc'
});