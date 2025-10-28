"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BarRectangle = BarRectangle;
exports.minPointSizeCallback = void 0;
var _react = _interopRequireDefault(require("react"));
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _ActiveShapeUtils = require("./ActiveShapeUtils");
var _DataUtils = require("./DataUtils");
var _excluded = ["x", "y"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
// Rectangle props is expecting x, y, height, width as numbers, name as a string, and radius as a custom type
// When props are being spread in from a user defined component in Bar,
// the prop types of an SVGElement have these typed as something else.
// This function will return the passed in props
// along with x, y, height as numbers, name as a string, and radius as number | [number, number, number, number]
function typeguardBarRectangleProps(_ref, props) {
  var xProp = _ref.x,
    yProp = _ref.y,
    option = _objectWithoutProperties(_ref, _excluded);
  var xValue = "".concat(xProp);
  var x = parseInt(xValue, 10);
  var yValue = "".concat(yProp);
  var y = parseInt(yValue, 10);
  var heightValue = "".concat(props.height || option.height);
  var height = parseInt(heightValue, 10);
  var widthValue = "".concat(props.width || option.width);
  var width = parseInt(widthValue, 10);
  return _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, props), option), x ? {
    x: x
  } : {}), y ? {
    y: y
  } : {}), {}, {
    height: height,
    width: width,
    name: props.name,
    radius: props.radius
  });
}
function BarRectangle(props) {
  return /*#__PURE__*/_react["default"].createElement(_ActiveShapeUtils.Shape, _extends({
    shapeType: "rectangle",
    propTransformer: typeguardBarRectangleProps,
    activeClassName: "recharts-active-bar"
  }, props));
}
/**
 * Safely gets minPointSize from from the minPointSize prop if it is a function
 * @param minPointSize minPointSize as passed to the Bar component
 * @param defaultValue default minPointSize
 * @returns minPointSize
 */
var minPointSizeCallback = exports.minPointSizeCallback = function minPointSizeCallback(minPointSize) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return function (value, index) {
    if (typeof minPointSize === 'number') return minPointSize;
    var isValueNumberOrNil = (0, _DataUtils.isNumber)(value) || (0, _DataUtils.isNullish)(value);
    if (isValueNumberOrNil) {
      return minPointSize(value, index);
    }
    !isValueNumberOrNil ? process.env.NODE_ENV !== "production" ? (0, _tinyInvariant["default"])(false, "minPointSize callback function received a value with type of ".concat(_typeof(value), ". Currently only numbers or null/undefined are supported.")) : (0, _tinyInvariant["default"])(false) : void 0;
    return defaultValue;
  };
};