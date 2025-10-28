function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Sector
 */
import React from 'react';
import clsx from 'clsx';
import { filterProps } from '../util/ReactUtils';
import { polarToCartesian, RADIAN } from '../util/PolarUtils';
import { getPercentValue, mathSign } from '../util/DataUtils';
var getDeltaAngle = function getDeltaAngle(startAngle, endAngle) {
  var sign = mathSign(endAngle - startAngle);
  var deltaAngle = Math.min(Math.abs(endAngle - startAngle), 359.999);
  return sign * deltaAngle;
};
var getTangentCircle = function getTangentCircle(_ref) {
  var cx = _ref.cx,
    cy = _ref.cy,
    radius = _ref.radius,
    angle = _ref.angle,
    sign = _ref.sign,
    isExternal = _ref.isExternal,
    cornerRadius = _ref.cornerRadius,
    cornerIsExternal = _ref.cornerIsExternal;
  var centerRadius = cornerRadius * (isExternal ? 1 : -1) + radius;
  var theta = Math.asin(cornerRadius / centerRadius) / RADIAN;
  var centerAngle = cornerIsExternal ? angle : angle + sign * theta;
  var center = polarToCartesian(cx, cy, centerRadius, centerAngle);
  // The coordinate of point which is tangent to the circle
  var circleTangency = polarToCartesian(cx, cy, radius, centerAngle);
  // The coordinate of point which is tangent to the radius line
  var lineTangencyAngle = cornerIsExternal ? angle - sign * theta : angle;
  var lineTangency = polarToCartesian(cx, cy, centerRadius * Math.cos(theta * RADIAN), lineTangencyAngle);
  return {
    center: center,
    circleTangency: circleTangency,
    lineTangency: lineTangency,
    theta: theta
  };
};
var getSectorPath = function getSectorPath(_ref2) {
  var cx = _ref2.cx,
    cy = _ref2.cy,
    innerRadius = _ref2.innerRadius,
    outerRadius = _ref2.outerRadius,
    startAngle = _ref2.startAngle,
    endAngle = _ref2.endAngle;
  var angle = getDeltaAngle(startAngle, endAngle);

  // When the angle of sector equals to 360, star point and end point coincide
  var tempEndAngle = startAngle + angle;
  var outerStartPoint = polarToCartesian(cx, cy, outerRadius, startAngle);
  var outerEndPoint = polarToCartesian(cx, cy, outerRadius, tempEndAngle);
  var path = "M ".concat(outerStartPoint.x, ",").concat(outerStartPoint.y, "\n    A ").concat(outerRadius, ",").concat(outerRadius, ",0,\n    ").concat(+(Math.abs(angle) > 180), ",").concat(+(startAngle > tempEndAngle), ",\n    ").concat(outerEndPoint.x, ",").concat(outerEndPoint.y, "\n  ");
  if (innerRadius > 0) {
    var innerStartPoint = polarToCartesian(cx, cy, innerRadius, startAngle);
    var innerEndPoint = polarToCartesian(cx, cy, innerRadius, tempEndAngle);
    path += "L ".concat(innerEndPoint.x, ",").concat(innerEndPoint.y, "\n            A ").concat(innerRadius, ",").concat(innerRadius, ",0,\n            ").concat(+(Math.abs(angle) > 180), ",").concat(+(startAngle <= tempEndAngle), ",\n            ").concat(innerStartPoint.x, ",").concat(innerStartPoint.y, " Z");
  } else {
    path += "L ".concat(cx, ",").concat(cy, " Z");
  }
  return path;
};
var getSectorWithCorner = function getSectorWithCorner(_ref3) {
  var cx = _ref3.cx,
    cy = _ref3.cy,
    innerRadius = _ref3.innerRadius,
    outerRadius = _ref3.outerRadius,
    cornerRadius = _ref3.cornerRadius,
    forceCornerRadius = _ref3.forceCornerRadius,
    cornerIsExternal = _ref3.cornerIsExternal,
    startAngle = _ref3.startAngle,
    endAngle = _ref3.endAngle;
  var sign = mathSign(endAngle - startAngle);
  var _getTangentCircle = getTangentCircle({
      cx: cx,
      cy: cy,
      radius: outerRadius,
      angle: startAngle,
      sign: sign,
      cornerRadius: cornerRadius,
      cornerIsExternal: cornerIsExternal
    }),
    soct = _getTangentCircle.circleTangency,
    solt = _getTangentCircle.lineTangency,
    sot = _getTangentCircle.theta;
  var _getTangentCircle2 = getTangentCircle({
      cx: cx,
      cy: cy,
      radius: outerRadius,
      angle: endAngle,
      sign: -sign,
      cornerRadius: cornerRadius,
      cornerIsExternal: cornerIsExternal
    }),
    eoct = _getTangentCircle2.circleTangency,
    eolt = _getTangentCircle2.lineTangency,
    eot = _getTangentCircle2.theta;
  var outerArcAngle = cornerIsExternal ? Math.abs(startAngle - endAngle) : Math.abs(startAngle - endAngle) - sot - eot;
  if (outerArcAngle < 0) {
    if (forceCornerRadius) {
      return "M ".concat(solt.x, ",").concat(solt.y, "\n        a").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,1,").concat(cornerRadius * 2, ",0\n        a").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,1,").concat(-cornerRadius * 2, ",0\n      ");
    }
    return getSectorPath({
      cx: cx,
      cy: cy,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: startAngle,
      endAngle: endAngle
    });
  }
  var path = "M ".concat(solt.x, ",").concat(solt.y, "\n    A").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,").concat(+(sign < 0), ",").concat(soct.x, ",").concat(soct.y, "\n    A").concat(outerRadius, ",").concat(outerRadius, ",0,").concat(+(outerArcAngle > 180), ",").concat(+(sign < 0), ",").concat(eoct.x, ",").concat(eoct.y, "\n    A").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,").concat(+(sign < 0), ",").concat(eolt.x, ",").concat(eolt.y, "\n  ");
  if (innerRadius > 0) {
    var _getTangentCircle3 = getTangentCircle({
        cx: cx,
        cy: cy,
        radius: innerRadius,
        angle: startAngle,
        sign: sign,
        isExternal: true,
        cornerRadius: cornerRadius,
        cornerIsExternal: cornerIsExternal
      }),
      sict = _getTangentCircle3.circleTangency,
      silt = _getTangentCircle3.lineTangency,
      sit = _getTangentCircle3.theta;
    var _getTangentCircle4 = getTangentCircle({
        cx: cx,
        cy: cy,
        radius: innerRadius,
        angle: endAngle,
        sign: -sign,
        isExternal: true,
        cornerRadius: cornerRadius,
        cornerIsExternal: cornerIsExternal
      }),
      eict = _getTangentCircle4.circleTangency,
      eilt = _getTangentCircle4.lineTangency,
      eit = _getTangentCircle4.theta;
    var innerArcAngle = cornerIsExternal ? Math.abs(startAngle - endAngle) : Math.abs(startAngle - endAngle) - sit - eit;
    if (innerArcAngle < 0 && cornerRadius === 0) {
      return "".concat(path, "L").concat(cx, ",").concat(cy, "Z");
    }
    path += "L".concat(eilt.x, ",").concat(eilt.y, "\n      A").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,").concat(+(sign < 0), ",").concat(eict.x, ",").concat(eict.y, "\n      A").concat(innerRadius, ",").concat(innerRadius, ",0,").concat(+(innerArcAngle > 180), ",").concat(+(sign > 0), ",").concat(sict.x, ",").concat(sict.y, "\n      A").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,").concat(+(sign < 0), ",").concat(silt.x, ",").concat(silt.y, "Z");
  } else {
    path += "L".concat(cx, ",").concat(cy, "Z");
  }
  return path;
};
var defaultProps = {
  cx: 0,
  cy: 0,
  innerRadius: 0,
  outerRadius: 0,
  startAngle: 0,
  endAngle: 0,
  cornerRadius: 0,
  forceCornerRadius: false,
  cornerIsExternal: false
};
export var Sector = function Sector(sectorProps) {
  var props = _objectSpread(_objectSpread({}, defaultProps), sectorProps);
  var cx = props.cx,
    cy = props.cy,
    innerRadius = props.innerRadius,
    outerRadius = props.outerRadius,
    cornerRadius = props.cornerRadius,
    forceCornerRadius = props.forceCornerRadius,
    cornerIsExternal = props.cornerIsExternal,
    startAngle = props.startAngle,
    endAngle = props.endAngle,
    className = props.className;
  if (outerRadius < innerRadius || startAngle === endAngle) {
    return null;
  }
  var layerClass = clsx('recharts-sector', className);
  var deltaRadius = outerRadius - innerRadius;
  var cr = getPercentValue(cornerRadius, deltaRadius, 0, true);
  var path;
  if (cr > 0 && Math.abs(startAngle - endAngle) < 360) {
    path = getSectorWithCorner({
      cx: cx,
      cy: cy,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      cornerRadius: Math.min(cr, deltaRadius / 2),
      forceCornerRadius: forceCornerRadius,
      cornerIsExternal: cornerIsExternal,
      startAngle: startAngle,
      endAngle: endAngle
    });
  } else {
    path = getSectorPath({
      cx: cx,
      cy: cy,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: startAngle,
      endAngle: endAngle
    });
  }
  return /*#__PURE__*/React.createElement("path", _extends({}, filterProps(props, true), {
    className: layerClass,
    d: path,
    role: "img"
  }));
};