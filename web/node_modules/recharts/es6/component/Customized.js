var _excluded = ["component"];
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
/**
 * @fileOverview Customized
 */
import React, { isValidElement, cloneElement, createElement } from 'react';
import isFunction from 'lodash/isFunction';
import { Layer } from '../container/Layer';
import { warn } from '../util/LogUtils';
/**
 * custom svg elements by rechart instance props and state.
 * @returns {Object}   svg elements
 */
export function Customized(_ref) {
  var component = _ref.component,
    props = _objectWithoutProperties(_ref, _excluded);
  var child;
  if ( /*#__PURE__*/isValidElement(component)) {
    child = /*#__PURE__*/cloneElement(component, props);
  } else if (isFunction(component)) {
    child = /*#__PURE__*/createElement(component, props);
  } else {
    warn(false, "Customized's props `component` must be React.element or Function, but got %s.", _typeof(component));
  }
  return /*#__PURE__*/React.createElement(Layer, {
    className: "recharts-customized-wrapper"
  }, child);
}
Customized.displayName = 'Customized';