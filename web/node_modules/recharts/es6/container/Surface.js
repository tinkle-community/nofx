var _excluded = ["children", "width", "height", "viewBox", "className", "style", "title", "desc"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
/**
 * @fileOverview Surface
 */
import React from 'react';
import clsx from 'clsx';
import { filterProps } from '../util/ReactUtils';
export function Surface(props) {
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
  var layerClass = clsx('recharts-surface', className);
  return /*#__PURE__*/React.createElement("svg", _extends({}, filterProps(others, true, 'svg'), {
    className: layerClass,
    width: width,
    height: height,
    style: style,
    viewBox: "".concat(svgView.x, " ").concat(svgView.y, " ").concat(svgView.width, " ").concat(svgView.height)
  }), /*#__PURE__*/React.createElement("title", null, title), /*#__PURE__*/React.createElement("desc", null, desc), children);
}