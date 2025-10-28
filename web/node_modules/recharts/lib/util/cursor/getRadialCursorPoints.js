"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRadialCursorPoints = getRadialCursorPoints;
var _PolarUtils = require("../PolarUtils");
/**
 * Only applicable for radial layouts
 * @param {Object} activeCoordinate ChartCoordinate
 * @returns {Object} RadialCursorPoints
 */
function getRadialCursorPoints(activeCoordinate) {
  var cx = activeCoordinate.cx,
    cy = activeCoordinate.cy,
    radius = activeCoordinate.radius,
    startAngle = activeCoordinate.startAngle,
    endAngle = activeCoordinate.endAngle;
  var startPoint = (0, _PolarUtils.polarToCartesian)(cx, cy, radius, startAngle);
  var endPoint = (0, _PolarUtils.polarToCartesian)(cx, cy, radius, endAngle);
  return {
    points: [startPoint, endPoint],
    cx: cx,
    cy: cy,
    radius: radius,
    startAngle: startAngle,
    endAngle: endAngle
  };
}