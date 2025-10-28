"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResponsiveContainer = void 0;
var _clsx = _interopRequireDefault(require("clsx"));
var _react = _interopRequireWildcard(require("react"));
var _throttle = _interopRequireDefault(require("lodash/throttle"));
var _DataUtils = require("../util/DataUtils");
var _LogUtils = require("../util/LogUtils");
var _ReactUtils = require("../util/ReactUtils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; } /**
 * @fileOverview Wrapper component to make charts adapt to the size of parent * DOM
 */
var ResponsiveContainer = exports.ResponsiveContainer = /*#__PURE__*/(0, _react.forwardRef)(function (_ref, ref) {
  var aspect = _ref.aspect,
    _ref$initialDimension = _ref.initialDimension,
    initialDimension = _ref$initialDimension === void 0 ? {
      width: -1,
      height: -1
    } : _ref$initialDimension,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? '100%' : _ref$width,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? '100%' : _ref$height,
    _ref$minWidth = _ref.minWidth,
    minWidth = _ref$minWidth === void 0 ? 0 : _ref$minWidth,
    minHeight = _ref.minHeight,
    maxHeight = _ref.maxHeight,
    children = _ref.children,
    _ref$debounce = _ref.debounce,
    debounce = _ref$debounce === void 0 ? 0 : _ref$debounce,
    id = _ref.id,
    className = _ref.className,
    onResize = _ref.onResize,
    _ref$style = _ref.style,
    style = _ref$style === void 0 ? {} : _ref$style;
  var containerRef = (0, _react.useRef)(null);
  var onResizeRef = (0, _react.useRef)();
  onResizeRef.current = onResize;
  (0, _react.useImperativeHandle)(ref, function () {
    return Object.defineProperty(containerRef.current, 'current', {
      get: function get() {
        // eslint-disable-next-line no-console
        console.warn('The usage of ref.current.current is deprecated and will no longer be supported.');
        return containerRef.current;
      },
      configurable: true
    });
  });
  var _useState = (0, _react.useState)({
      containerWidth: initialDimension.width,
      containerHeight: initialDimension.height
    }),
    _useState2 = _slicedToArray(_useState, 2),
    sizes = _useState2[0],
    setSizes = _useState2[1];
  var setContainerSize = (0, _react.useCallback)(function (newWidth, newHeight) {
    setSizes(function (prevState) {
      var roundedWidth = Math.round(newWidth);
      var roundedHeight = Math.round(newHeight);
      if (prevState.containerWidth === roundedWidth && prevState.containerHeight === roundedHeight) {
        return prevState;
      }
      return {
        containerWidth: roundedWidth,
        containerHeight: roundedHeight
      };
    });
  }, []);
  (0, _react.useEffect)(function () {
    var callback = function callback(entries) {
      var _onResizeRef$current;
      var _entries$0$contentRec = entries[0].contentRect,
        containerWidth = _entries$0$contentRec.width,
        containerHeight = _entries$0$contentRec.height;
      setContainerSize(containerWidth, containerHeight);
      (_onResizeRef$current = onResizeRef.current) === null || _onResizeRef$current === void 0 || _onResizeRef$current.call(onResizeRef, containerWidth, containerHeight);
    };
    if (debounce > 0) {
      callback = (0, _throttle["default"])(callback, debounce, {
        trailing: true,
        leading: false
      });
    }
    var observer = new ResizeObserver(callback);
    var _containerRef$current = containerRef.current.getBoundingClientRect(),
      containerWidth = _containerRef$current.width,
      containerHeight = _containerRef$current.height;
    setContainerSize(containerWidth, containerHeight);
    observer.observe(containerRef.current);
    return function () {
      observer.disconnect();
    };
  }, [setContainerSize, debounce]);
  var chartContent = (0, _react.useMemo)(function () {
    var containerWidth = sizes.containerWidth,
      containerHeight = sizes.containerHeight;
    if (containerWidth < 0 || containerHeight < 0) {
      return null;
    }
    (0, _LogUtils.warn)((0, _DataUtils.isPercent)(width) || (0, _DataUtils.isPercent)(height), "The width(%s) and height(%s) are both fixed numbers,\n       maybe you don't need to use a ResponsiveContainer.", width, height);
    (0, _LogUtils.warn)(!aspect || aspect > 0, 'The aspect(%s) must be greater than zero.', aspect);
    var calculatedWidth = (0, _DataUtils.isPercent)(width) ? containerWidth : width;
    var calculatedHeight = (0, _DataUtils.isPercent)(height) ? containerHeight : height;
    if (aspect && aspect > 0) {
      // Preserve the desired aspect ratio
      if (calculatedWidth) {
        // Will default to using width for aspect ratio
        calculatedHeight = calculatedWidth / aspect;
      } else if (calculatedHeight) {
        // But we should also take height into consideration
        calculatedWidth = calculatedHeight * aspect;
      }

      // if maxHeight is set, overwrite if calculatedHeight is greater than maxHeight
      if (maxHeight && calculatedHeight > maxHeight) {
        calculatedHeight = maxHeight;
      }
    }
    (0, _LogUtils.warn)(calculatedWidth > 0 || calculatedHeight > 0, "The width(%s) and height(%s) of chart should be greater than 0,\n       please check the style of container, or the props width(%s) and height(%s),\n       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the\n       height and width.", calculatedWidth, calculatedHeight, width, height, minWidth, minHeight, aspect);
    var isCharts = !Array.isArray(children) && (0, _ReactUtils.getDisplayName)(children.type).endsWith('Chart');
    return _react["default"].Children.map(children, function (child) {
      if ( /*#__PURE__*/_react["default"].isValidElement(child)) {
        return /*#__PURE__*/(0, _react.cloneElement)(child, _objectSpread({
          width: calculatedWidth,
          height: calculatedHeight
        }, isCharts ? {
          style: _objectSpread({
            height: '100%',
            width: '100%',
            maxHeight: calculatedHeight,
            maxWidth: calculatedWidth
          }, child.props.style)
        } : {}));
      }
      return child;
    });
  }, [aspect, children, height, maxHeight, minHeight, minWidth, sizes, width]);
  return /*#__PURE__*/_react["default"].createElement("div", {
    id: id ? "".concat(id) : undefined,
    className: (0, _clsx["default"])('recharts-responsive-container', className),
    style: _objectSpread(_objectSpread({}, style), {}, {
      width: width,
      height: height,
      minWidth: minWidth,
      minHeight: minHeight,
      maxHeight: maxHeight
    }),
    ref: containerRef
  }, chartContent);
});