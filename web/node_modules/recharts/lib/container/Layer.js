"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Layer = void 0;
var _react = _interopRequireDefault(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _ReactUtils = require("../util/ReactUtils");
var _excluded = ["children", "className"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
var Layer = exports.Layer = /*#__PURE__*/_react["default"].forwardRef(function (props, ref) {
  var children = props.children,
    className = props.className,
    others = _objectWithoutProperties(props, _excluded);
  var layerClass = (0, _clsx["default"])('recharts-layer', className);
  return /*#__PURE__*/_react["default"].createElement("g", _extends({
    className: layerClass
  }, (0, _ReactUtils.filterProps)(others, true), {
    ref: ref
  }), children);
});