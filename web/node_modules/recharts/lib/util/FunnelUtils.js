"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FunnelTrapezoid = FunnelTrapezoid;
exports.typeGuardTrapezoidProps = typeGuardTrapezoidProps;
var _react = _interopRequireDefault(require("react"));
var _ActiveShapeUtils = require("./ActiveShapeUtils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// Trapezoid props is expecting x, y, height as numbers.
// When props are being spread in from a user defined component in Funnel,
// the prop types of an SVGElement have these typed as string | number.
// This function will return the passed in props along with x, y, height as numbers.
function typeGuardTrapezoidProps(option, props) {
  var xValue = "".concat(props.x || option.x);
  var x = parseInt(xValue, 10);
  var yValue = "".concat(props.y || option.y);
  var y = parseInt(yValue, 10);
  var heightValue = "".concat((props === null || props === void 0 ? void 0 : props.height) || (option === null || option === void 0 ? void 0 : option.height));
  var height = parseInt(heightValue, 10);
  return _objectSpread(_objectSpread(_objectSpread({}, props), (0, _ActiveShapeUtils.getPropsFromShapeOption)(option)), {}, {
    height: height,
    x: x,
    y: y
  });
}
function FunnelTrapezoid(props) {
  return /*#__PURE__*/_react["default"].createElement(_ActiveShapeUtils.Shape, _extends({
    shapeType: "trapezoid",
    propTransformer: typeGuardTrapezoidProps
  }, props));
}