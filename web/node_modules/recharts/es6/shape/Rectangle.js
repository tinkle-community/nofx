function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Rectangle
 */
import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import Animate from 'react-smooth';
import { filterProps } from '../util/ReactUtils';
var getRectanglePath = function getRectanglePath(x, y, width, height, radius) {
  var maxRadius = Math.min(Math.abs(width) / 2, Math.abs(height) / 2);
  var ySign = height >= 0 ? 1 : -1;
  var xSign = width >= 0 ? 1 : -1;
  var clockWise = height >= 0 && width >= 0 || height < 0 && width < 0 ? 1 : 0;
  var path;
  if (maxRadius > 0 && radius instanceof Array) {
    var newRadius = [0, 0, 0, 0];
    for (var i = 0, len = 4; i < len; i++) {
      newRadius[i] = radius[i] > maxRadius ? maxRadius : radius[i];
    }
    path = "M".concat(x, ",").concat(y + ySign * newRadius[0]);
    if (newRadius[0] > 0) {
      path += "A ".concat(newRadius[0], ",").concat(newRadius[0], ",0,0,").concat(clockWise, ",").concat(x + xSign * newRadius[0], ",").concat(y);
    }
    path += "L ".concat(x + width - xSign * newRadius[1], ",").concat(y);
    if (newRadius[1] > 0) {
      path += "A ".concat(newRadius[1], ",").concat(newRadius[1], ",0,0,").concat(clockWise, ",\n        ").concat(x + width, ",").concat(y + ySign * newRadius[1]);
    }
    path += "L ".concat(x + width, ",").concat(y + height - ySign * newRadius[2]);
    if (newRadius[2] > 0) {
      path += "A ".concat(newRadius[2], ",").concat(newRadius[2], ",0,0,").concat(clockWise, ",\n        ").concat(x + width - xSign * newRadius[2], ",").concat(y + height);
    }
    path += "L ".concat(x + xSign * newRadius[3], ",").concat(y + height);
    if (newRadius[3] > 0) {
      path += "A ".concat(newRadius[3], ",").concat(newRadius[3], ",0,0,").concat(clockWise, ",\n        ").concat(x, ",").concat(y + height - ySign * newRadius[3]);
    }
    path += 'Z';
  } else if (maxRadius > 0 && radius === +radius && radius > 0) {
    var _newRadius = Math.min(maxRadius, radius);
    path = "M ".concat(x, ",").concat(y + ySign * _newRadius, "\n            A ").concat(_newRadius, ",").concat(_newRadius, ",0,0,").concat(clockWise, ",").concat(x + xSign * _newRadius, ",").concat(y, "\n            L ").concat(x + width - xSign * _newRadius, ",").concat(y, "\n            A ").concat(_newRadius, ",").concat(_newRadius, ",0,0,").concat(clockWise, ",").concat(x + width, ",").concat(y + ySign * _newRadius, "\n            L ").concat(x + width, ",").concat(y + height - ySign * _newRadius, "\n            A ").concat(_newRadius, ",").concat(_newRadius, ",0,0,").concat(clockWise, ",").concat(x + width - xSign * _newRadius, ",").concat(y + height, "\n            L ").concat(x + xSign * _newRadius, ",").concat(y + height, "\n            A ").concat(_newRadius, ",").concat(_newRadius, ",0,0,").concat(clockWise, ",").concat(x, ",").concat(y + height - ySign * _newRadius, " Z");
  } else {
    path = "M ".concat(x, ",").concat(y, " h ").concat(width, " v ").concat(height, " h ").concat(-width, " Z");
  }
  return path;
};
export var isInRectangle = function isInRectangle(point, rect) {
  if (!point || !rect) {
    return false;
  }
  var px = point.x,
    py = point.y;
  var x = rect.x,
    y = rect.y,
    width = rect.width,
    height = rect.height;
  if (Math.abs(width) > 0 && Math.abs(height) > 0) {
    var minX = Math.min(x, x + width);
    var maxX = Math.max(x, x + width);
    var minY = Math.min(y, y + height);
    var maxY = Math.max(y, y + height);
    return px >= minX && px <= maxX && py >= minY && py <= maxY;
  }
  return false;
};
var defaultProps = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  // The radius of border
  // The radius of four corners when radius is a number
  // The radius of left-top, right-top, right-bottom, left-bottom when radius is an array
  radius: 0,
  isAnimationActive: false,
  isUpdateAnimationActive: false,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease'
};
export var Rectangle = function Rectangle(rectangleProps) {
  var props = _objectSpread(_objectSpread({}, defaultProps), rectangleProps);
  var pathRef = useRef();
  var _useState = useState(-1),
    _useState2 = _slicedToArray(_useState, 2),
    totalLength = _useState2[0],
    setTotalLength = _useState2[1];
  useEffect(function () {
    if (pathRef.current && pathRef.current.getTotalLength) {
      try {
        var pathTotalLength = pathRef.current.getTotalLength();
        if (pathTotalLength) {
          setTotalLength(pathTotalLength);
        }
      } catch (err) {
        // calculate total length error
      }
    }
  }, []);
  var x = props.x,
    y = props.y,
    width = props.width,
    height = props.height,
    radius = props.radius,
    className = props.className;
  var animationEasing = props.animationEasing,
    animationDuration = props.animationDuration,
    animationBegin = props.animationBegin,
    isAnimationActive = props.isAnimationActive,
    isUpdateAnimationActive = props.isUpdateAnimationActive;
  if (x !== +x || y !== +y || width !== +width || height !== +height || width === 0 || height === 0) {
    return null;
  }
  var layerClass = clsx('recharts-rectangle', className);
  if (!isUpdateAnimationActive) {
    return /*#__PURE__*/React.createElement("path", _extends({}, filterProps(props, true), {
      className: layerClass,
      d: getRectanglePath(x, y, width, height, radius)
    }));
  }
  return /*#__PURE__*/React.createElement(Animate, {
    canBegin: totalLength > 0,
    from: {
      width: width,
      height: height,
      x: x,
      y: y
    },
    to: {
      width: width,
      height: height,
      x: x,
      y: y
    },
    duration: animationDuration,
    animationEasing: animationEasing,
    isActive: isUpdateAnimationActive
  }, function (_ref) {
    var currWidth = _ref.width,
      currHeight = _ref.height,
      currX = _ref.x,
      currY = _ref.y;
    return /*#__PURE__*/React.createElement(Animate, {
      canBegin: totalLength > 0,
      from: "0px ".concat(totalLength === -1 ? 1 : totalLength, "px"),
      to: "".concat(totalLength, "px 0px"),
      attributeName: "strokeDasharray",
      begin: animationBegin,
      duration: animationDuration,
      isActive: isAnimationActive,
      easing: animationEasing
    }, /*#__PURE__*/React.createElement("path", _extends({}, filterProps(props, true), {
      className: layerClass,
      d: getRectanglePath(currX, currY, currWidth, currHeight, radius),
      ref: pathRef
    })));
  });
};