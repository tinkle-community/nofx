function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import clsx from 'clsx';
import { isNumber } from '../DataUtils';
var CSS_CLASS_PREFIX = 'recharts-tooltip-wrapper';
var TOOLTIP_HIDDEN = {
  visibility: 'hidden'
};
export function getTooltipCSSClassName(_ref) {
  var coordinate = _ref.coordinate,
    translateX = _ref.translateX,
    translateY = _ref.translateY;
  return clsx(CSS_CLASS_PREFIX, _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, "".concat(CSS_CLASS_PREFIX, "-right"), isNumber(translateX) && coordinate && isNumber(coordinate.x) && translateX >= coordinate.x), "".concat(CSS_CLASS_PREFIX, "-left"), isNumber(translateX) && coordinate && isNumber(coordinate.x) && translateX < coordinate.x), "".concat(CSS_CLASS_PREFIX, "-bottom"), isNumber(translateY) && coordinate && isNumber(coordinate.y) && translateY >= coordinate.y), "".concat(CSS_CLASS_PREFIX, "-top"), isNumber(translateY) && coordinate && isNumber(coordinate.y) && translateY < coordinate.y));
}
export function getTooltipTranslateXY(_ref2) {
  var allowEscapeViewBox = _ref2.allowEscapeViewBox,
    coordinate = _ref2.coordinate,
    key = _ref2.key,
    offsetTopLeft = _ref2.offsetTopLeft,
    position = _ref2.position,
    reverseDirection = _ref2.reverseDirection,
    tooltipDimension = _ref2.tooltipDimension,
    viewBox = _ref2.viewBox,
    viewBoxDimension = _ref2.viewBoxDimension;
  if (position && isNumber(position[key])) {
    return position[key];
  }
  var negative = coordinate[key] - tooltipDimension - offsetTopLeft;
  var positive = coordinate[key] + offsetTopLeft;
  if (allowEscapeViewBox[key]) {
    return reverseDirection[key] ? negative : positive;
  }
  if (reverseDirection[key]) {
    var _tooltipBoundary = negative;
    var _viewBoxBoundary = viewBox[key];
    if (_tooltipBoundary < _viewBoxBoundary) {
      return Math.max(positive, viewBox[key]);
    }
    return Math.max(negative, viewBox[key]);
  }
  var tooltipBoundary = positive + tooltipDimension;
  var viewBoxBoundary = viewBox[key] + viewBoxDimension;
  if (tooltipBoundary > viewBoxBoundary) {
    return Math.max(negative, viewBox[key]);
  }
  return Math.max(positive, viewBox[key]);
}
export function getTransformStyle(_ref3) {
  var translateX = _ref3.translateX,
    translateY = _ref3.translateY,
    useTranslate3d = _ref3.useTranslate3d;
  return {
    transform: useTranslate3d ? "translate3d(".concat(translateX, "px, ").concat(translateY, "px, 0)") : "translate(".concat(translateX, "px, ").concat(translateY, "px)")
  };
}
export function getTooltipTranslate(_ref4) {
  var allowEscapeViewBox = _ref4.allowEscapeViewBox,
    coordinate = _ref4.coordinate,
    offsetTopLeft = _ref4.offsetTopLeft,
    position = _ref4.position,
    reverseDirection = _ref4.reverseDirection,
    tooltipBox = _ref4.tooltipBox,
    useTranslate3d = _ref4.useTranslate3d,
    viewBox = _ref4.viewBox;
  var cssProperties, translateX, translateY;
  if (tooltipBox.height > 0 && tooltipBox.width > 0 && coordinate) {
    translateX = getTooltipTranslateXY({
      allowEscapeViewBox: allowEscapeViewBox,
      coordinate: coordinate,
      key: 'x',
      offsetTopLeft: offsetTopLeft,
      position: position,
      reverseDirection: reverseDirection,
      tooltipDimension: tooltipBox.width,
      viewBox: viewBox,
      viewBoxDimension: viewBox.width
    });
    translateY = getTooltipTranslateXY({
      allowEscapeViewBox: allowEscapeViewBox,
      coordinate: coordinate,
      key: 'y',
      offsetTopLeft: offsetTopLeft,
      position: position,
      reverseDirection: reverseDirection,
      tooltipDimension: tooltipBox.height,
      viewBox: viewBox,
      viewBoxDimension: viewBox.height
    });
    cssProperties = getTransformStyle({
      translateX: translateX,
      translateY: translateY,
      useTranslate3d: useTranslate3d
    });
  } else {
    cssProperties = TOOLTIP_HIDDEN;
  }
  return {
    cssProperties: cssProperties,
    cssClasses: getTooltipCSSClassName({
      translateX: translateX,
      translateY: translateY,
      coordinate: coordinate
    })
  };
}