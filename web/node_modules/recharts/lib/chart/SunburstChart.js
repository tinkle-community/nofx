"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SunburstChart = void 0;
var _react = _interopRequireWildcard(require("react"));
var _d3Scale = require("victory-vendor/d3-scale");
var _clsx = _interopRequireDefault(require("clsx"));
var _ReactUtils = require("../util/ReactUtils");
var _Surface = require("../container/Surface");
var _Layer = require("../container/Layer");
var _Sector = require("../shape/Sector");
var _Text = require("../component/Text");
var _PolarUtils = require("../util/PolarUtils");
var _Tooltip = require("../component/Tooltip");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var defaultTextProps = {
  fontWeight: 'bold',
  paintOrder: 'stroke fill',
  fontSize: '.75rem',
  stroke: '#FFF',
  fill: 'black',
  pointerEvents: 'none'
};
function getMaxDepthOf(node) {
  if (!node.children || node.children.length === 0) return 1;

  // Calculate depth for each child and find the maximum
  var childDepths = node.children.map(function (d) {
    return getMaxDepthOf(d);
  });
  return 1 + Math.max.apply(Math, _toConsumableArray(childDepths));
}
var SunburstChart = exports.SunburstChart = function SunburstChart(_ref) {
  var className = _ref.className,
    data = _ref.data,
    children = _ref.children,
    width = _ref.width,
    height = _ref.height,
    _ref$padding = _ref.padding,
    padding = _ref$padding === void 0 ? 2 : _ref$padding,
    _ref$dataKey = _ref.dataKey,
    dataKey = _ref$dataKey === void 0 ? 'value' : _ref$dataKey,
    _ref$ringPadding = _ref.ringPadding,
    ringPadding = _ref$ringPadding === void 0 ? 2 : _ref$ringPadding,
    _ref$innerRadius = _ref.innerRadius,
    innerRadius = _ref$innerRadius === void 0 ? 50 : _ref$innerRadius,
    _ref$fill = _ref.fill,
    fill = _ref$fill === void 0 ? '#333' : _ref$fill,
    _ref$stroke = _ref.stroke,
    stroke = _ref$stroke === void 0 ? '#FFF' : _ref$stroke,
    _ref$textOptions = _ref.textOptions,
    textOptions = _ref$textOptions === void 0 ? defaultTextProps : _ref$textOptions,
    _ref$outerRadius = _ref.outerRadius,
    outerRadius = _ref$outerRadius === void 0 ? Math.min(width, height) / 2 : _ref$outerRadius,
    _ref$cx = _ref.cx,
    cx = _ref$cx === void 0 ? width / 2 : _ref$cx,
    _ref$cy = _ref.cy,
    cy = _ref$cy === void 0 ? height / 2 : _ref$cy,
    _ref$startAngle = _ref.startAngle,
    startAngle = _ref$startAngle === void 0 ? 0 : _ref$startAngle,
    _ref$endAngle = _ref.endAngle,
    endAngle = _ref$endAngle === void 0 ? 360 : _ref$endAngle,
    onClick = _ref.onClick,
    onMouseEnter = _ref.onMouseEnter,
    onMouseLeave = _ref.onMouseLeave;
  var _useState = (0, _react.useState)(false),
    _useState2 = _slicedToArray(_useState, 2),
    isTooltipActive = _useState2[0],
    setIsTooltipActive = _useState2[1];
  var _useState3 = (0, _react.useState)(null),
    _useState4 = _slicedToArray(_useState3, 2),
    activeNode = _useState4[0],
    setActiveNode = _useState4[1];
  var rScale = (0, _d3Scale.scaleLinear)([0, data[dataKey]], [0, endAngle]);
  var treeDepth = getMaxDepthOf(data);
  var thickness = (outerRadius - innerRadius) / treeDepth;
  var sectors = [];
  var positions = new Map([]);

  // event handlers
  function handleMouseEnter(node, e) {
    if (onMouseEnter) onMouseEnter(node, e);
    setActiveNode(node);
    setIsTooltipActive(true);
  }
  function handleMouseLeave(node, e) {
    if (onMouseLeave) onMouseLeave(node, e);
    setActiveNode(null);
    setIsTooltipActive(false);
  }
  function handleClick(node) {
    if (onClick) onClick(node);
  }

  // recursively add nodes for each data point and its children
  function drawArcs(childNodes, options) {
    var radius = options.radius,
      innerR = options.innerR,
      initialAngle = options.initialAngle,
      childColor = options.childColor;
    var currentAngle = initialAngle;
    if (!childNodes) return; // base case: no children of this node

    childNodes.forEach(function (d) {
      var _ref2, _d$fill;
      var arcLength = rScale(d[dataKey]);
      var start = currentAngle;
      // color priority - if there's a color on the individual point use that, otherwise use parent color or default
      var fillColor = (_ref2 = (_d$fill = d === null || d === void 0 ? void 0 : d.fill) !== null && _d$fill !== void 0 ? _d$fill : childColor) !== null && _ref2 !== void 0 ? _ref2 : fill;
      var _polarToCartesian = (0, _PolarUtils.polarToCartesian)(0, 0, innerR + radius / 2, -(start + arcLength - arcLength / 2)),
        textX = _polarToCartesian.x,
        textY = _polarToCartesian.y;
      currentAngle += arcLength;
      sectors.push(
      /*#__PURE__*/
      // TODO: Missing key warning. Can we use `key={d.name}`?
      _react["default"].createElement("g", {
        "aria-label": d.name,
        tabIndex: 0
      }, /*#__PURE__*/_react["default"].createElement(_Sector.Sector, {
        onClick: function onClick() {
          return handleClick(d);
        },
        onMouseEnter: function onMouseEnter(e) {
          return handleMouseEnter(d, e);
        },
        onMouseLeave: function onMouseLeave(e) {
          return handleMouseLeave(d, e);
        },
        fill: fillColor,
        stroke: stroke,
        strokeWidth: padding,
        startAngle: start,
        endAngle: start + arcLength,
        innerRadius: innerR,
        outerRadius: innerR + radius,
        cx: cx,
        cy: cy
      }), /*#__PURE__*/_react["default"].createElement(_Text.Text, _extends({}, textOptions, {
        alignmentBaseline: "middle",
        textAnchor: "middle",
        x: textX + cx,
        y: cy - textY
      }), d[dataKey])));
      var _polarToCartesian2 = (0, _PolarUtils.polarToCartesian)(cx, cy, innerR + radius / 2, start),
        tooltipX = _polarToCartesian2.x,
        tooltipY = _polarToCartesian2.y;
      positions.set(d.name, {
        x: tooltipX,
        y: tooltipY
      });
      return drawArcs(d.children, {
        radius: radius,
        innerR: innerR + radius + ringPadding,
        initialAngle: start,
        childColor: fillColor
      });
    });
  }
  drawArcs(data.children, {
    radius: thickness,
    innerR: innerRadius,
    initialAngle: startAngle
  });
  var layerClass = (0, _clsx["default"])('recharts-sunburst', className);
  function renderTooltip() {
    var tooltipComponent = (0, _ReactUtils.findChildByType)([children], _Tooltip.Tooltip);
    if (!tooltipComponent || !activeNode) return null;
    var viewBox = {
      x: 0,
      y: 0,
      width: width,
      height: height
    };
    return /*#__PURE__*/_react["default"].cloneElement(tooltipComponent, {
      viewBox: viewBox,
      coordinate: positions.get(activeNode.name),
      payload: [activeNode],
      active: isTooltipActive
    });
  }
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: (0, _clsx["default"])('recharts-wrapper', className),
    style: {
      position: 'relative',
      width: width,
      height: height
    },
    role: "region"
  }, /*#__PURE__*/_react["default"].createElement(_Surface.Surface, {
    width: width,
    height: height
  }, children, /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
    className: layerClass
  }, sectors)), renderTooltip());
};