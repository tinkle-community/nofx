"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Customized = Customized;
var _react = _interopRequireWildcard(require("react"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _Layer = require("../container/Layer");
var _LogUtils = require("../util/LogUtils");
var _excluded = ["component"];
/**
 * @fileOverview Customized
 */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
/**
 * custom svg elements by rechart instance props and state.
 * @returns {Object}   svg elements
 */
function Customized(_ref) {
  var component = _ref.component,
    props = _objectWithoutProperties(_ref, _excluded);
  var child;
  if ( /*#__PURE__*/(0, _react.isValidElement)(component)) {
    child = /*#__PURE__*/(0, _react.cloneElement)(component, props);
  } else if ((0, _isFunction["default"])(component)) {
    child = /*#__PURE__*/(0, _react.createElement)(component, props);
  } else {
    (0, _LogUtils.warn)(false, "Customized's props `component` must be React.element or Function, but got %s.", _typeof(component));
  }
  return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
    className: "recharts-customized-wrapper"
  }, child);
}
Customized.displayName = 'Customized';