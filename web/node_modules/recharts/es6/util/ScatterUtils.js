var _excluded = ["option", "isActive"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
import * as React from 'react';
import { Symbols } from '../shape/Symbols';
import { Shape } from './ActiveShapeUtils';
export function ScatterSymbol(_ref) {
  var option = _ref.option,
    isActive = _ref.isActive,
    props = _objectWithoutProperties(_ref, _excluded);
  if (typeof option === 'string') {
    return /*#__PURE__*/React.createElement(Shape, _extends({
      option: /*#__PURE__*/React.createElement(Symbols, _extends({
        type: option
      }, props)),
      isActive: isActive,
      shapeType: "symbols"
    }, props));
  }
  return /*#__PURE__*/React.createElement(Shape, _extends({
    option: option,
    isActive: isActive,
    shapeType: "symbols"
  }, props));
}