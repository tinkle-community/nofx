"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Surface = Surface;
var _react = _interopRequireDefault(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _ReactUtils = require("../util/ReactUtils");
var _excluded = ["children", "width", "height", "viewBox", "className", "style", "title", "desc"];
/**
 * @fileOverview Surface
 */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function Surface(props) {
  var children = props.children,
    width = props.width,
    height = props.height,
    viewBox = props.viewBox,
    className = props.className,
    style = props.style,
    title = props.title,
    desc = props.desc,
    others = _objectWithoutProperties(props, _excluded);
  var svgView = viewBox || {
    width: width,
    height: height,
    x: 0,
    y: 0
  };
  var layerClass = (0, _clsx["default"])('recharts-surface', className);
  return /*#__PURE__*/_react["default"].createElement("svg", _extends({}, (0, _ReactUtils.filterProps)(others, true, 'svg'), {
    className: layerClass,
    width: width,
    height: height,
    style: style,
    viewBox: "".concat(svgView.x, " ").concat(svgView.y, " ").concat(svgView.width, " ").concat(svgView.height)
  }), /*#__PURE__*/_react["default"].createElement("title", null, title), /*#__PURE__*/_react["default"].createElement("desc", null, desc), children);
}