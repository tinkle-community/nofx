function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { cloneElement, createElement, isValidElement } from 'react';
import clsx from 'clsx';
import { Curve } from '../shape/Curve';
import { Cross } from '../shape/Cross';
import { getCursorRectangle } from '../util/cursor/getCursorRectangle';
import { Rectangle } from '../shape/Rectangle';
import { getRadialCursorPoints } from '../util/cursor/getRadialCursorPoints';
import { Sector } from '../shape/Sector';
import { getCursorPoints } from '../util/cursor/getCursorPoints';
import { filterProps } from '../util/ReactUtils';
/*
 * Cursor is the background, or a highlight,
 * that shows when user mouses over or activates
 * an area.
 *
 * It usually shows together with a tooltip
 * to emphasise which part of the chart does the tooltip refer to.
 */
export function Cursor(props) {
  var _element$props$cursor, _defaultProps;
  var element = props.element,
    tooltipEventType = props.tooltipEventType,
    isActive = props.isActive,
    activeCoordinate = props.activeCoordinate,
    activePayload = props.activePayload,
    offset = props.offset,
    activeTooltipIndex = props.activeTooltipIndex,
    tooltipAxisBandSize = props.tooltipAxisBandSize,
    layout = props.layout,
    chartName = props.chartName;
  var elementPropsCursor = (_element$props$cursor = element.props.cursor) !== null && _element$props$cursor !== void 0 ? _element$props$cursor : (_defaultProps = element.type.defaultProps) === null || _defaultProps === void 0 ? void 0 : _defaultProps.cursor;
  if (!element || !elementPropsCursor || !isActive || !activeCoordinate || chartName !== 'ScatterChart' && tooltipEventType !== 'axis') {
    return null;
  }
  var restProps;
  var cursorComp = Curve;
  if (chartName === 'ScatterChart') {
    restProps = activeCoordinate;
    cursorComp = Cross;
  } else if (chartName === 'BarChart') {
    restProps = getCursorRectangle(layout, activeCoordinate, offset, tooltipAxisBandSize);
    cursorComp = Rectangle;
  } else if (layout === 'radial') {
    var _getRadialCursorPoint = getRadialCursorPoints(activeCoordinate),
      cx = _getRadialCursorPoint.cx,
      cy = _getRadialCursorPoint.cy,
      radius = _getRadialCursorPoint.radius,
      startAngle = _getRadialCursorPoint.startAngle,
      endAngle = _getRadialCursorPoint.endAngle;
    restProps = {
      cx: cx,
      cy: cy,
      startAngle: startAngle,
      endAngle: endAngle,
      innerRadius: radius,
      outerRadius: radius
    };
    cursorComp = Sector;
  } else {
    restProps = {
      points: getCursorPoints(layout, activeCoordinate, offset)
    };
    cursorComp = Curve;
  }
  var cursorProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({
    stroke: '#ccc',
    pointerEvents: 'none'
  }, offset), restProps), filterProps(elementPropsCursor, false)), {}, {
    payload: activePayload,
    payloadIndex: activeTooltipIndex,
    className: clsx('recharts-tooltip-cursor', elementPropsCursor.className)
  });
  return /*#__PURE__*/isValidElement(elementPropsCursor) ? /*#__PURE__*/cloneElement(elementPropsCursor, cursorProps) : /*#__PURE__*/createElement(cursorComp, cursorProps);
}