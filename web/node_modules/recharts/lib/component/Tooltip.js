"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tooltip = void 0;
var _react = _interopRequireWildcard(require("react"));
var _DefaultTooltipContent = require("./DefaultTooltipContent");
var _TooltipBoundingBox = require("./TooltipBoundingBox");
var _Global = require("../util/Global");
var _getUniqPayload = require("../util/payload/getUniqPayload");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * @fileOverview Tooltip
 */
function defaultUniqBy(entry) {
  return entry.dataKey;
}
function renderContent(content, props) {
  if ( /*#__PURE__*/_react["default"].isValidElement(content)) {
    return /*#__PURE__*/_react["default"].cloneElement(content, props);
  }
  if (typeof content === 'function') {
    return /*#__PURE__*/_react["default"].createElement(content, props);
  }
  return /*#__PURE__*/_react["default"].createElement(_DefaultTooltipContent.DefaultTooltipContent, props);
}
var Tooltip = exports.Tooltip = /*#__PURE__*/function (_PureComponent) {
  function Tooltip() {
    _classCallCheck(this, Tooltip);
    return _callSuper(this, Tooltip, arguments);
  }
  _inherits(Tooltip, _PureComponent);
  return _createClass(Tooltip, [{
    key: "render",
    value: function render() {
      var _this = this;
      var _this$props = this.props,
        active = _this$props.active,
        allowEscapeViewBox = _this$props.allowEscapeViewBox,
        animationDuration = _this$props.animationDuration,
        animationEasing = _this$props.animationEasing,
        content = _this$props.content,
        coordinate = _this$props.coordinate,
        filterNull = _this$props.filterNull,
        isAnimationActive = _this$props.isAnimationActive,
        offset = _this$props.offset,
        payload = _this$props.payload,
        payloadUniqBy = _this$props.payloadUniqBy,
        position = _this$props.position,
        reverseDirection = _this$props.reverseDirection,
        useTranslate3d = _this$props.useTranslate3d,
        viewBox = _this$props.viewBox,
        wrapperStyle = _this$props.wrapperStyle;
      var finalPayload = payload !== null && payload !== void 0 ? payload : [];
      if (filterNull && finalPayload.length) {
        finalPayload = (0, _getUniqPayload.getUniqPayload)(payload.filter(function (entry) {
          return entry.value != null && (entry.hide !== true || _this.props.includeHidden);
        }), payloadUniqBy, defaultUniqBy);
      }
      var hasPayload = finalPayload.length > 0;
      return /*#__PURE__*/_react["default"].createElement(_TooltipBoundingBox.TooltipBoundingBox, {
        allowEscapeViewBox: allowEscapeViewBox,
        animationDuration: animationDuration,
        animationEasing: animationEasing,
        isAnimationActive: isAnimationActive,
        active: active,
        coordinate: coordinate,
        hasPayload: hasPayload,
        offset: offset,
        position: position,
        reverseDirection: reverseDirection,
        useTranslate3d: useTranslate3d,
        viewBox: viewBox,
        wrapperStyle: wrapperStyle
      }, renderContent(content, _objectSpread(_objectSpread({}, this.props), {}, {
        payload: finalPayload
      })));
    }
  }]);
}(_react.PureComponent);
_defineProperty(Tooltip, "displayName", 'Tooltip');
_defineProperty(Tooltip, "defaultProps", {
  accessibilityLayer: false,
  allowEscapeViewBox: {
    x: false,
    y: false
  },
  animationDuration: 400,
  animationEasing: 'ease',
  contentStyle: {},
  coordinate: {
    x: 0,
    y: 0
  },
  cursor: true,
  cursorStyle: {},
  filterNull: true,
  isAnimationActive: !_Global.Global.isSsr,
  itemStyle: {},
  labelStyle: {},
  offset: 10,
  reverseDirection: {
    x: false,
    y: false
  },
  separator: ' : ',
  trigger: 'hover',
  useTranslate3d: false,
  viewBox: {
    x: 0,
    y: 0,
    height: 0,
    width: 0
  },
  wrapperStyle: {}
});