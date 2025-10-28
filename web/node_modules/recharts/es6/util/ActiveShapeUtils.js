var _excluded = ["option", "shapeType", "propTransformer", "activeClassName", "isActive"];
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React, { isValidElement, cloneElement } from 'react';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import isBoolean from 'lodash/isBoolean';
import isEqual from 'lodash/isEqual';
import { Rectangle } from '../shape/Rectangle';
import { Trapezoid } from '../shape/Trapezoid';
import { Sector } from '../shape/Sector';
import { Layer } from '../container/Layer';
import { Symbols } from '../shape/Symbols';

/**
 * This is an abstraction for rendering a user defined prop for a customized shape in several forms.
 *
 * <Shape /> is the root and will handle taking in:
 *  - an object of svg properties
 *  - a boolean
 *  - a render prop(inline function that returns jsx)
 *  - a react element
 *
 * <ShapeSelector /> is a subcomponent of <Shape /> and used to match a component
 * to the value of props.shapeType that is passed to the root.
 *
 */

function defaultPropTransformer(option, props) {
  return _objectSpread(_objectSpread({}, props), option);
}
function isSymbolsProps(shapeType, _elementProps) {
  return shapeType === 'symbols';
}
function ShapeSelector(_ref) {
  var shapeType = _ref.shapeType,
    elementProps = _ref.elementProps;
  switch (shapeType) {
    case 'rectangle':
      return /*#__PURE__*/React.createElement(Rectangle, elementProps);
    case 'trapezoid':
      return /*#__PURE__*/React.createElement(Trapezoid, elementProps);
    case 'sector':
      return /*#__PURE__*/React.createElement(Sector, elementProps);
    case 'symbols':
      if (isSymbolsProps(shapeType, elementProps)) {
        return /*#__PURE__*/React.createElement(Symbols, elementProps);
      }
      break;
    default:
      return null;
  }
}
export function getPropsFromShapeOption(option) {
  if ( /*#__PURE__*/isValidElement(option)) {
    return option.props;
  }
  return option;
}
export function Shape(_ref2) {
  var option = _ref2.option,
    shapeType = _ref2.shapeType,
    _ref2$propTransformer = _ref2.propTransformer,
    propTransformer = _ref2$propTransformer === void 0 ? defaultPropTransformer : _ref2$propTransformer,
    _ref2$activeClassName = _ref2.activeClassName,
    activeClassName = _ref2$activeClassName === void 0 ? 'recharts-active-shape' : _ref2$activeClassName,
    isActive = _ref2.isActive,
    props = _objectWithoutProperties(_ref2, _excluded);
  var shape;
  if ( /*#__PURE__*/isValidElement(option)) {
    shape = /*#__PURE__*/cloneElement(option, _objectSpread(_objectSpread({}, props), getPropsFromShapeOption(option)));
  } else if (isFunction(option)) {
    shape = option(props);
  } else if (isPlainObject(option) && !isBoolean(option)) {
    var nextProps = propTransformer(option, props);
    shape = /*#__PURE__*/React.createElement(ShapeSelector, {
      shapeType: shapeType,
      elementProps: nextProps
    });
  } else {
    var elementProps = props;
    shape = /*#__PURE__*/React.createElement(ShapeSelector, {
      shapeType: shapeType,
      elementProps: elementProps
    });
  }
  if (isActive) {
    return /*#__PURE__*/React.createElement(Layer, {
      className: activeClassName
    }, shape);
  }
  return shape;
}

/**
 * This is an abstraction to handle identifying the active index from a tooltip mouse interaction
 */

export function isFunnel(graphicalItem, _item) {
  return _item != null && 'trapezoids' in graphicalItem.props;
}
export function isPie(graphicalItem, _item) {
  return _item != null && 'sectors' in graphicalItem.props;
}
export function isScatter(graphicalItem, _item) {
  return _item != null && 'points' in graphicalItem.props;
}
export function compareFunnel(shapeData, activeTooltipItem) {
  var _activeTooltipItem$la, _activeTooltipItem$la2;
  var xMatches = shapeData.x === (activeTooltipItem === null || activeTooltipItem === void 0 || (_activeTooltipItem$la = activeTooltipItem.labelViewBox) === null || _activeTooltipItem$la === void 0 ? void 0 : _activeTooltipItem$la.x) || shapeData.x === activeTooltipItem.x;
  var yMatches = shapeData.y === (activeTooltipItem === null || activeTooltipItem === void 0 || (_activeTooltipItem$la2 = activeTooltipItem.labelViewBox) === null || _activeTooltipItem$la2 === void 0 ? void 0 : _activeTooltipItem$la2.y) || shapeData.y === activeTooltipItem.y;
  return xMatches && yMatches;
}
export function comparePie(shapeData, activeTooltipItem) {
  var startAngleMatches = shapeData.endAngle === activeTooltipItem.endAngle;
  var endAngleMatches = shapeData.startAngle === activeTooltipItem.startAngle;
  return startAngleMatches && endAngleMatches;
}
export function compareScatter(shapeData, activeTooltipItem) {
  var xMatches = shapeData.x === activeTooltipItem.x;
  var yMatches = shapeData.y === activeTooltipItem.y;
  var zMatches = shapeData.z === activeTooltipItem.z;
  return xMatches && yMatches && zMatches;
}
function getComparisonFn(graphicalItem, activeItem) {
  var comparison;
  if (isFunnel(graphicalItem, activeItem)) {
    comparison = compareFunnel;
  } else if (isPie(graphicalItem, activeItem)) {
    comparison = comparePie;
  } else if (isScatter(graphicalItem, activeItem)) {
    comparison = compareScatter;
  }
  return comparison;
}
function getShapeDataKey(graphicalItem, activeItem) {
  var shapeKey;
  if (isFunnel(graphicalItem, activeItem)) {
    shapeKey = 'trapezoids';
  } else if (isPie(graphicalItem, activeItem)) {
    shapeKey = 'sectors';
  } else if (isScatter(graphicalItem, activeItem)) {
    shapeKey = 'points';
  }
  return shapeKey;
}
function getActiveShapeTooltipPayload(graphicalItem, activeItem) {
  if (isFunnel(graphicalItem, activeItem)) {
    var _activeItem$tooltipPa;
    return (_activeItem$tooltipPa = activeItem.tooltipPayload) === null || _activeItem$tooltipPa === void 0 || (_activeItem$tooltipPa = _activeItem$tooltipPa[0]) === null || _activeItem$tooltipPa === void 0 || (_activeItem$tooltipPa = _activeItem$tooltipPa.payload) === null || _activeItem$tooltipPa === void 0 ? void 0 : _activeItem$tooltipPa.payload;
  }
  if (isPie(graphicalItem, activeItem)) {
    var _activeItem$tooltipPa2;
    return (_activeItem$tooltipPa2 = activeItem.tooltipPayload) === null || _activeItem$tooltipPa2 === void 0 || (_activeItem$tooltipPa2 = _activeItem$tooltipPa2[0]) === null || _activeItem$tooltipPa2 === void 0 || (_activeItem$tooltipPa2 = _activeItem$tooltipPa2.payload) === null || _activeItem$tooltipPa2 === void 0 ? void 0 : _activeItem$tooltipPa2.payload;
  }
  if (isScatter(graphicalItem, activeItem)) {
    return activeItem.payload;
  }
  return {};
}
/**
 *
 * @param {GetActiveShapeIndexForTooltip} arg an object of incoming attributes from Tooltip
 * @returns {number}
 *
 * To handle possible duplicates in the data set,
 * match both the data value of the active item to a data value on a graph item,
 * and match the mouse coordinates of the active item to the coordinates of in a particular components shape data.
 * This assumes equal lengths of shape objects to data items.
 */
export function getActiveShapeIndexForTooltip(_ref3) {
  var activeTooltipItem = _ref3.activeTooltipItem,
    graphicalItem = _ref3.graphicalItem,
    itemData = _ref3.itemData;
  var shapeKey = getShapeDataKey(graphicalItem, activeTooltipItem);
  var tooltipPayload = getActiveShapeTooltipPayload(graphicalItem, activeTooltipItem);
  var activeItemMatches = itemData.filter(function (datum, dataIndex) {
    var valuesMatch = isEqual(tooltipPayload, datum);
    var mouseCoordinateMatches = graphicalItem.props[shapeKey].filter(function (shapeData) {
      var comparison = getComparisonFn(graphicalItem, activeTooltipItem);
      return comparison(shapeData, activeTooltipItem);
    });

    // get the last index in case of multiple matches
    var indexOfMouseCoordinates = graphicalItem.props[shapeKey].indexOf(mouseCoordinateMatches[mouseCoordinateMatches.length - 1]);
    var coordinatesMatch = dataIndex === indexOfMouseCoordinates;
    return valuesMatch && coordinatesMatch;
  });

  // get the last index in case of multiple matches
  var activeIndex = itemData.indexOf(activeItemMatches[activeItemMatches.length - 1]);
  return activeIndex;
}