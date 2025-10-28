function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _excluded = ["type", "size", "sizeType"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
/**
 * @fileOverview Curve
 */
import React from 'react';
import upperFirst from 'lodash/upperFirst';
import { symbol as shapeSymbol, symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye } from 'victory-vendor/d3-shape';
import clsx from 'clsx';
import { filterProps } from '../util/ReactUtils';
var symbolFactories = {
  symbolCircle: symbolCircle,
  symbolCross: symbolCross,
  symbolDiamond: symbolDiamond,
  symbolSquare: symbolSquare,
  symbolStar: symbolStar,
  symbolTriangle: symbolTriangle,
  symbolWye: symbolWye
};
var RADIAN = Math.PI / 180;
var getSymbolFactory = function getSymbolFactory(type) {
  var name = "symbol".concat(upperFirst(type));
  return symbolFactories[name] || symbolCircle;
};
var calculateAreaSize = function calculateAreaSize(size, sizeType, type) {
  if (sizeType === 'area') {
    return size;
  }
  switch (type) {
    case 'cross':
      return 5 * size * size / 9;
    case 'diamond':
      return 0.5 * size * size / Math.sqrt(3);
    case 'square':
      return size * size;
    case 'star':
      {
        var angle = 18 * RADIAN;
        return 1.25 * size * size * (Math.tan(angle) - Math.tan(angle * 2) * Math.pow(Math.tan(angle), 2));
      }
    case 'triangle':
      return Math.sqrt(3) * size * size / 4;
    case 'wye':
      return (21 - 10 * Math.sqrt(3)) * size * size / 8;
    default:
      return Math.PI * size * size / 4;
  }
};
var registerSymbol = function registerSymbol(key, factory) {
  symbolFactories["symbol".concat(upperFirst(key))] = factory;
};
export var Symbols = function Symbols(_ref) {
  var _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'circle' : _ref$type,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 64 : _ref$size,
    _ref$sizeType = _ref.sizeType,
    sizeType = _ref$sizeType === void 0 ? 'area' : _ref$sizeType,
    rest = _objectWithoutProperties(_ref, _excluded);
  var props = _objectSpread(_objectSpread({}, rest), {}, {
    type: type,
    size: size,
    sizeType: sizeType
  });

  /**
   * Calculate the path of curve
   * @return {String} path
   */
  var getPath = function getPath() {
    var symbolFactory = getSymbolFactory(type);
    var symbol = shapeSymbol().type(symbolFactory).size(calculateAreaSize(size, sizeType, type));
    return symbol();
  };
  var className = props.className,
    cx = props.cx,
    cy = props.cy;
  var filteredProps = filterProps(props, true);
  if (cx === +cx && cy === +cy && size === +size) {
    return /*#__PURE__*/React.createElement("path", _extends({}, filteredProps, {
      className: clsx('recharts-symbols', className),
      transform: "translate(".concat(cx, ", ").concat(cy, ")"),
      d: getPath()
    }));
  }
  return null;
};
Symbols.registerSymbol = registerSymbol;