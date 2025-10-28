"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReferenceArea = void 0;
var _react = _interopRequireDefault(require("react"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _clsx = _interopRequireDefault(require("clsx"));
var _Layer = require("../container/Layer");
var _Label = require("../component/Label");
var _CartesianUtils = require("../util/CartesianUtils");
var _IfOverflowMatches = require("../util/IfOverflowMatches");
var _DataUtils = require("../util/DataUtils");
var _LogUtils = require("../util/LogUtils");
var _Rectangle = require("../shape/Rectangle");
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
 * @fileOverview Reference Line
 */
var getRect = function getRect(hasX1, hasX2, hasY1, hasY2, props) {
  var xValue1 = props.x1,
    xValue2 = props.x2,
    yValue1 = props.y1,
    yValue2 = props.y2,
    xAxis = props.xAxis,
    yAxis = props.yAxis;
  if (!xAxis || !yAxis) return null;
  var scales = (0, _CartesianUtils.createLabeledScales)({
    x: xAxis.scale,
    y: yAxis.scale
  });
  var p1 = {
    x: hasX1 ? scales.x.apply(xValue1, {
      position: 'start'
    }) : scales.x.rangeMin,
    y: hasY1 ? scales.y.apply(yValue1, {
      position: 'start'
    }) : scales.y.rangeMin
  };
  var p2 = {
    x: hasX2 ? scales.x.apply(xValue2, {
      position: 'end'
    }) : scales.x.rangeMax,
    y: hasY2 ? scales.y.apply(yValue2, {
      position: 'end'
    }) : scales.y.rangeMax
  };
  if ((0, _IfOverflowMatches.ifOverflowMatches)(props, 'discard') && (!scales.isInRange(p1) || !scales.isInRange(p2))) {
    return null;
  }
  return (0, _CartesianUtils.rectWithPoints)(p1, p2);
};

// eslint-disable-next-line react/prefer-stateless-function -- requires static defaultProps
var ReferenceArea = exports.ReferenceArea = /*#__PURE__*/function (_React$Component) {
  function ReferenceArea() {
    _classCallCheck(this, ReferenceArea);
    return _callSuper(this, ReferenceArea, arguments);
  }
  _inherits(ReferenceArea, _React$Component);
  return _createClass(ReferenceArea, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
        x1 = _this$props.x1,
        x2 = _this$props.x2,
        y1 = _this$props.y1,
        y2 = _this$props.y2,
        className = _this$props.className,
        alwaysShow = _this$props.alwaysShow,
        clipPathId = _this$props.clipPathId;
      (0, _LogUtils.warn)(alwaysShow === undefined, 'The alwaysShow prop is deprecated. Please use ifOverflow="extendDomain" instead.');
      var hasX1 = (0, _DataUtils.isNumOrStr)(x1);
      var hasX2 = (0, _DataUtils.isNumOrStr)(x2);
      var hasY1 = (0, _DataUtils.isNumOrStr)(y1);
      var hasY2 = (0, _DataUtils.isNumOrStr)(y2);
      var shape = this.props.shape;
      if (!hasX1 && !hasX2 && !hasY1 && !hasY2 && !shape) {
        return null;
      }
      var rect = getRect(hasX1, hasX2, hasY1, hasY2, this.props);
      if (!rect && !shape) {
        return null;
      }
      var clipPath = (0, _IfOverflowMatches.ifOverflowMatches)(this.props, 'hidden') ? "url(#".concat(clipPathId, ")") : undefined;
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: (0, _clsx["default"])('recharts-reference-area', className)
      }, ReferenceArea.renderRect(shape, _objectSpread(_objectSpread({
        clipPath: clipPath
      }, (0, _ReactUtils.filterProps)(this.props, true)), rect)), _Label.Label.renderCallByParent(this.props, rect));
    }
  }]);
}(_react["default"].Component);
_defineProperty(ReferenceArea, "displayName", 'ReferenceArea');
_defineProperty(ReferenceArea, "defaultProps", {
  isFront: false,
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  r: 10,
  fill: '#ccc',
  fillOpacity: 0.5,
  stroke: 'none',
  strokeWidth: 1
});
_defineProperty(ReferenceArea, "renderRect", function (option, props) {
  var rect;
  if ( /*#__PURE__*/_react["default"].isValidElement(option)) {
    rect = /*#__PURE__*/_react["default"].cloneElement(option, props);
  } else if ((0, _isFunction["default"])(option)) {
    rect = option(props);
  } else {
    rect = /*#__PURE__*/_react["default"].createElement(_Rectangle.Rectangle, _extends({}, props, {
      className: "recharts-reference-area-rect"
    }));
  }
  return rect;
});