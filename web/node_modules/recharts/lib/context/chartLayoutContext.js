"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useYAxisWithFiniteDomainOrRandom = exports.useYAxisOrThrow = exports.useXAxisOrThrow = exports.useViewBox = exports.useOffset = exports.useClipPathId = exports.useChartWidth = exports.useChartHeight = exports.useArbitraryYAxis = exports.useArbitraryXAxis = exports.YAxisContext = exports.XAxisContext = exports.ViewBoxContext = exports.OffsetContext = exports.ClipPathIdContext = exports.ChartWidthContext = exports.ChartLayoutContextProvider = exports.ChartHeightContext = void 0;
var _react = _interopRequireWildcard(require("react"));
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _find = _interopRequireDefault(require("lodash/find"));
var _every = _interopRequireDefault(require("lodash/every"));
var _calculateViewBox = require("../util/calculateViewBox");
var _DataUtils = require("../util/DataUtils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var XAxisContext = exports.XAxisContext = /*#__PURE__*/(0, _react.createContext)(undefined);
var YAxisContext = exports.YAxisContext = /*#__PURE__*/(0, _react.createContext)(undefined);
var ViewBoxContext = exports.ViewBoxContext = /*#__PURE__*/(0, _react.createContext)(undefined);
var OffsetContext = exports.OffsetContext = /*#__PURE__*/(0, _react.createContext)({});
var ClipPathIdContext = exports.ClipPathIdContext = /*#__PURE__*/(0, _react.createContext)(undefined);
var ChartHeightContext = exports.ChartHeightContext = /*#__PURE__*/(0, _react.createContext)(0);
var ChartWidthContext = exports.ChartWidthContext = /*#__PURE__*/(0, _react.createContext)(0);

/**
 * Will add all the properties required to render all individual Recharts components into a React Context.
 *
 * If you want to read these properties, see the collection of hooks exported from this file.
 *
 * @param {object} props CategoricalChartState, plus children
 * @returns {ReactElement} React Context Provider
 */
var ChartLayoutContextProvider = exports.ChartLayoutContextProvider = function ChartLayoutContextProvider(props) {
  var _props$state = props.state,
    xAxisMap = _props$state.xAxisMap,
    yAxisMap = _props$state.yAxisMap,
    offset = _props$state.offset,
    clipPathId = props.clipPathId,
    children = props.children,
    width = props.width,
    height = props.height;

  /**
   * Perhaps we should compute this property when reading? Let's see what is more often used
   */
  var viewBox = (0, _calculateViewBox.calculateViewBox)(offset);

  /*
   * This pretends to be a single context but actually is split into multiple smaller ones.
   * Why?
   * Because one React Context only allows to set one value.
   * But we need to set multiple values.
   * If we do that with one context, then we force re-render on components that might not even be interested
   * in the part of the state that has changed.
   *
   * By splitting into smaller contexts, we allow each components to be optimized and only re-render when its dependencies change.
   *
   * To actually achieve the optimal re-render, it is necessary to use React.memo().
   * See the test file for details.
   */
  return /*#__PURE__*/_react["default"].createElement(XAxisContext.Provider, {
    value: xAxisMap
  }, /*#__PURE__*/_react["default"].createElement(YAxisContext.Provider, {
    value: yAxisMap
  }, /*#__PURE__*/_react["default"].createElement(OffsetContext.Provider, {
    value: offset
  }, /*#__PURE__*/_react["default"].createElement(ViewBoxContext.Provider, {
    value: viewBox
  }, /*#__PURE__*/_react["default"].createElement(ClipPathIdContext.Provider, {
    value: clipPathId
  }, /*#__PURE__*/_react["default"].createElement(ChartHeightContext.Provider, {
    value: height
  }, /*#__PURE__*/_react["default"].createElement(ChartWidthContext.Provider, {
    value: width
  }, children)))))));
};
var useClipPathId = exports.useClipPathId = function useClipPathId() {
  return (0, _react.useContext)(ClipPathIdContext);
};
function getKeysForDebug(object) {
  var keys = Object.keys(object);
  if (keys.length === 0) {
    return 'There are no available ids.';
  }
  return "Available ids are: ".concat(keys, ".");
}

/**
 * This either finds and returns Axis by the specified ID, or throws an exception if an axis with this ID does not exist.
 *
 * @param xAxisId identifier of the axis - it's either autogenerated ('0'), or passed via `id` prop as <XAxis id='foo' />
 * @returns axis configuration object
 * @throws Error if no axis with this ID exists
 */
var useXAxisOrThrow = exports.useXAxisOrThrow = function useXAxisOrThrow(xAxisId) {
  var xAxisMap = (0, _react.useContext)(XAxisContext);
  !(xAxisMap != null) ? process.env.NODE_ENV !== "production" ? (0, _tinyInvariant["default"])(false, 'Could not find Recharts context; are you sure this is rendered inside a Recharts wrapper component?') : (0, _tinyInvariant["default"])(false) : void 0;
  var xAxis = xAxisMap[xAxisId];
  !(xAxis != null) ? process.env.NODE_ENV !== "production" ? (0, _tinyInvariant["default"])(false, "Could not find xAxis by id \"".concat(xAxisId, "\" [").concat(_typeof(xAxisId), "]. ").concat(getKeysForDebug(xAxisMap))) : (0, _tinyInvariant["default"])(false) : void 0;
  return xAxis;
};

/**
 * This will find an arbitrary first XAxis. If there's exactly one it always returns that one
 * - but if there are multiple then it can return any of those.
 *
 * If you want specific XAxis out of multiple then prefer using useXAxisOrThrow
 *
 * @returns X axisOptions, or undefined - if there are no X axes
 */
var useArbitraryXAxis = exports.useArbitraryXAxis = function useArbitraryXAxis() {
  var xAxisMap = (0, _react.useContext)(XAxisContext);
  return (0, _DataUtils.getAnyElementOfObject)(xAxisMap);
};

/**
 * This will find an arbitrary first YAxis. If there's exactly one it always returns that one
 * - but if there are multiple then it can return any of those.
 *
 * If you want specific YAxis out of multiple then prefer using useXAxisOrThrow
 *
 * @returns Y axisOptions, or undefined - if there are no Y axes
 */
var useArbitraryYAxis = exports.useArbitraryYAxis = function useArbitraryYAxis() {
  var yAxisMap = (0, _react.useContext)(YAxisContext);
  return (0, _DataUtils.getAnyElementOfObject)(yAxisMap);
};

/**
 * This hooks will:
 * 1st attempt to find an YAxis that has all elements in its domain finite
 * If no such axis exists, it will return an arbitrary YAxis
 * if there are no Y axes then it returns undefined
 *
 * @returns Either Y axisOptions, or undefined if there are no Y axes
 */
var useYAxisWithFiniteDomainOrRandom = exports.useYAxisWithFiniteDomainOrRandom = function useYAxisWithFiniteDomainOrRandom() {
  var yAxisMap = (0, _react.useContext)(YAxisContext);
  var yAxisWithFiniteDomain = (0, _find["default"])(yAxisMap, function (axis) {
    return (0, _every["default"])(axis.domain, Number.isFinite);
  });
  return yAxisWithFiniteDomain || (0, _DataUtils.getAnyElementOfObject)(yAxisMap);
};

/**
 * This either finds and returns Axis by the specified ID, or throws an exception if an axis with this ID does not exist.
 *
 * @param yAxisId identifier of the axis - it's either autogenerated ('0'), or passed via `id` prop as <YAxis id='foo' />
 * @returns axis configuration object
 * @throws Error if no axis with this ID exists
 */
var useYAxisOrThrow = exports.useYAxisOrThrow = function useYAxisOrThrow(yAxisId) {
  var yAxisMap = (0, _react.useContext)(YAxisContext);
  !(yAxisMap != null) ? process.env.NODE_ENV !== "production" ? (0, _tinyInvariant["default"])(false, 'Could not find Recharts context; are you sure this is rendered inside a Recharts wrapper component?') : (0, _tinyInvariant["default"])(false) : void 0;
  var yAxis = yAxisMap[yAxisId];
  !(yAxis != null) ? process.env.NODE_ENV !== "production" ? (0, _tinyInvariant["default"])(false, "Could not find yAxis by id \"".concat(yAxisId, "\" [").concat(_typeof(yAxisId), "]. ").concat(getKeysForDebug(yAxisMap))) : (0, _tinyInvariant["default"])(false) : void 0;
  return yAxis;
};
var useViewBox = exports.useViewBox = function useViewBox() {
  var viewBox = (0, _react.useContext)(ViewBoxContext);
  return viewBox;
};
var useOffset = exports.useOffset = function useOffset() {
  return (0, _react.useContext)(OffsetContext);
};
var useChartWidth = exports.useChartWidth = function useChartWidth() {
  return (0, _react.useContext)(ChartWidthContext);
};
var useChartHeight = exports.useChartHeight = function useChartHeight() {
  return (0, _react.useContext)(ChartHeightContext);
};