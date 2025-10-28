"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReferenceDot = void 0;
var _react = _interopRequireDefault(require("react"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _clsx = _interopRequireDefault(require("clsx"));
var _Layer = require("../container/Layer");
var _Dot = require("../shape/Dot");
var _Label = require("../component/Label");
var _DataUtils = require("../util/DataUtils");
var _IfOverflowMatches = require("../util/IfOverflowMatches");
var _CartesianUtils = require("../util/CartesianUtils");
var _LogUtils = require("../util/LogUtils");
var _ReactUtils = require("../util/ReactUtils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
 * @fileOverview Reference Dot
 */
var getCoordinate = function getCoordinate(props) {
  var x = props.x,
    y = props.y,
    xAxis = props.xAxis,
    yAxis = props.yAxis;
  var scales = (0, _CartesianUtils.createLabeledScales)({
    x: xAxis.scale,
    y: yAxis.scale
  });
  var result = scales.apply({
    x: x,
    y: y
  }, {
    bandAware: true
  });
  if ((0, _IfOverflowMatches.ifOverflowMatches)(props, 'discard') && !scales.isInRange(result)) {
    return null;
  }
  return result;
};

// eslint-disable-next-line react/prefer-stateless-function -- requires static defaultProps
var ReferenceDot = exports.ReferenceDot = /*#__PURE__*/function (_React$Component) {
  function ReferenceDot() {
    _classCallCheck(this, ReferenceDot);
    return _callSuper(this, ReferenceDot, arguments);
  }
  _inherits(ReferenceDot, _React$Component);
  return _createClass(ReferenceDot, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
        x = _this$props.x,
        y = _this$props.y,
        r = _this$props.r,
        alwaysShow = _this$props.alwaysShow,
        clipPathId = _this$props.clipPathId;
      var isX = (0, _DataUtils.isNumOrStr)(x);
      var isY = (0, _DataUtils.isNumOrStr)(y);
      (0, _LogUtils.warn)(alwaysShow === undefined, 'The alwaysShow prop is deprecated. Please use ifOverflow="extendDomain" instead.');
      if (!isX || !isY) {
        return null;
      }
      var coordinate = getCoordinate(this.props);
      if (!coordinate) {
        return null;
      }
      var cx = coordinate.x,
        cy = coordinate.y;
      var _this$props2 = this.props,
        shape = _this$props2.shape,
        className = _this$props2.className;
      var clipPath = (0, _IfOverflowMatches.ifOverflowMatches)(this.props, 'hidden') ? "url(#".concat(clipPathId, ")") : undefined;
      var dotProps = _objectSpread(_objectSpread({
        clipPath: clipPath
      }, (0, _ReactUtils.filterProps)(this.props, true)), {}, {
        cx: cx,
        cy: cy
      });
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: (0, _clsx["default"])('recharts-reference-dot', className)
      }, ReferenceDot.renderDot(shape, dotProps), _Label.Label.renderCallByParent(this.props, {
        x: cx - r,
        y: cy - r,
        width: 2 * r,
        height: 2 * r
      }));
    }
  }]);
}(_react["default"].Component);
_defineProperty(ReferenceDot, "displayName", 'ReferenceDot');
_defineProperty(ReferenceDot, "defaultProps", {
  isFront: false,
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  r: 10,
  fill: '#fff',
  stroke: '#ccc',
  fillOpacity: 1,
  strokeWidth: 1
});
_defineProperty(ReferenceDot, "renderDot", function (option, props) {
  var dot;
  if ( /*#__PURE__*/_react["default"].isValidElement(option)) {
    dot = /*#__PURE__*/_react["default"].cloneElement(option, props);
  } else if ((0, _isFunction["default"])(option)) {
    dot = option(props);
  } else {
    dot = /*#__PURE__*/_react["default"].createElement(_Dot.Dot, _extends({}, props, {
      cx: props.cx,
      cy: props.cy,
      className: "recharts-reference-dot-dot"
    }));
  }
  return dot;
});