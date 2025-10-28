"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Radar = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactSmooth = _interopRequireDefault(require("react-smooth"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _last = _interopRequireDefault(require("lodash/last"));
var _first = _interopRequireDefault(require("lodash/first"));
var _isEqual = _interopRequireDefault(require("lodash/isEqual"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _clsx = _interopRequireDefault(require("clsx"));
var _DataUtils = require("../util/DataUtils");
var _Global = require("../util/Global");
var _PolarUtils = require("../util/PolarUtils");
var _ChartUtils = require("../util/ChartUtils");
var _Polygon = require("../shape/Polygon");
var _Dot = require("../shape/Dot");
var _Layer = require("../container/Layer");
var _LabelList = require("../component/LabelList");
var _ReactUtils = require("../util/ReactUtils");
var _excluded = ["key"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
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
 * @fileOverview Radar
 */
var Radar = exports.Radar = /*#__PURE__*/function (_PureComponent) {
  function Radar() {
    var _this;
    _classCallCheck(this, Radar);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Radar, [].concat(args));
    _defineProperty(_this, "state", {
      isAnimationFinished: false
    });
    _defineProperty(_this, "handleAnimationEnd", function () {
      var onAnimationEnd = _this.props.onAnimationEnd;
      _this.setState({
        isAnimationFinished: true
      });
      if ((0, _isFunction["default"])(onAnimationEnd)) {
        onAnimationEnd();
      }
    });
    _defineProperty(_this, "handleAnimationStart", function () {
      var onAnimationStart = _this.props.onAnimationStart;
      _this.setState({
        isAnimationFinished: false
      });
      if ((0, _isFunction["default"])(onAnimationStart)) {
        onAnimationStart();
      }
    });
    _defineProperty(_this, "handleMouseEnter", function (e) {
      var onMouseEnter = _this.props.onMouseEnter;
      if (onMouseEnter) {
        onMouseEnter(_this.props, e);
      }
    });
    _defineProperty(_this, "handleMouseLeave", function (e) {
      var onMouseLeave = _this.props.onMouseLeave;
      if (onMouseLeave) {
        onMouseLeave(_this.props, e);
      }
    });
    return _this;
  }
  _inherits(Radar, _PureComponent);
  return _createClass(Radar, [{
    key: "renderDots",
    value: function renderDots(points) {
      var _this$props = this.props,
        dot = _this$props.dot,
        dataKey = _this$props.dataKey;
      var baseProps = (0, _ReactUtils.filterProps)(this.props, false);
      var customDotProps = (0, _ReactUtils.filterProps)(dot, true);
      var dots = points.map(function (entry, i) {
        var dotProps = _objectSpread(_objectSpread(_objectSpread({
          key: "dot-".concat(i),
          r: 3
        }, baseProps), customDotProps), {}, {
          dataKey: dataKey,
          cx: entry.x,
          cy: entry.y,
          index: i,
          payload: entry
        });
        return Radar.renderDotItem(dot, dotProps);
      });
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: "recharts-radar-dots"
      }, dots);
    }
  }, {
    key: "renderPolygonStatically",
    value: function renderPolygonStatically(points) {
      var _this$props2 = this.props,
        shape = _this$props2.shape,
        dot = _this$props2.dot,
        isRange = _this$props2.isRange,
        baseLinePoints = _this$props2.baseLinePoints,
        connectNulls = _this$props2.connectNulls;
      var radar;
      if ( /*#__PURE__*/_react["default"].isValidElement(shape)) {
        radar = /*#__PURE__*/_react["default"].cloneElement(shape, _objectSpread(_objectSpread({}, this.props), {}, {
          points: points
        }));
      } else if ((0, _isFunction["default"])(shape)) {
        radar = shape(_objectSpread(_objectSpread({}, this.props), {}, {
          points: points
        }));
      } else {
        radar = /*#__PURE__*/_react["default"].createElement(_Polygon.Polygon, _extends({}, (0, _ReactUtils.filterProps)(this.props, true), {
          onMouseEnter: this.handleMouseEnter,
          onMouseLeave: this.handleMouseLeave,
          points: points,
          baseLinePoints: isRange ? baseLinePoints : null,
          connectNulls: connectNulls
        }));
      }
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: "recharts-radar-polygon"
      }, radar, dot ? this.renderDots(points) : null);
    }
  }, {
    key: "renderPolygonWithAnimation",
    value: function renderPolygonWithAnimation() {
      var _this2 = this;
      var _this$props3 = this.props,
        points = _this$props3.points,
        isAnimationActive = _this$props3.isAnimationActive,
        animationBegin = _this$props3.animationBegin,
        animationDuration = _this$props3.animationDuration,
        animationEasing = _this$props3.animationEasing,
        animationId = _this$props3.animationId;
      var prevPoints = this.state.prevPoints;
      return /*#__PURE__*/_react["default"].createElement(_reactSmooth["default"], {
        begin: animationBegin,
        duration: animationDuration,
        isActive: isAnimationActive,
        easing: animationEasing,
        from: {
          t: 0
        },
        to: {
          t: 1
        },
        key: "radar-".concat(animationId),
        onAnimationEnd: this.handleAnimationEnd,
        onAnimationStart: this.handleAnimationStart
      }, function (_ref) {
        var t = _ref.t;
        var prevPointsDiffFactor = prevPoints && prevPoints.length / points.length;
        var stepData = points.map(function (entry, index) {
          var prev = prevPoints && prevPoints[Math.floor(index * prevPointsDiffFactor)];
          if (prev) {
            var _interpolatorX = (0, _DataUtils.interpolateNumber)(prev.x, entry.x);
            var _interpolatorY = (0, _DataUtils.interpolateNumber)(prev.y, entry.y);
            return _objectSpread(_objectSpread({}, entry), {}, {
              x: _interpolatorX(t),
              y: _interpolatorY(t)
            });
          }
          var interpolatorX = (0, _DataUtils.interpolateNumber)(entry.cx, entry.x);
          var interpolatorY = (0, _DataUtils.interpolateNumber)(entry.cy, entry.y);
          return _objectSpread(_objectSpread({}, entry), {}, {
            x: interpolatorX(t),
            y: interpolatorY(t)
          });
        });
        return _this2.renderPolygonStatically(stepData);
      });
    }
  }, {
    key: "renderPolygon",
    value: function renderPolygon() {
      var _this$props4 = this.props,
        points = _this$props4.points,
        isAnimationActive = _this$props4.isAnimationActive,
        isRange = _this$props4.isRange;
      var prevPoints = this.state.prevPoints;
      if (isAnimationActive && points && points.length && !isRange && (!prevPoints || !(0, _isEqual["default"])(prevPoints, points))) {
        return this.renderPolygonWithAnimation();
      }
      return this.renderPolygonStatically(points);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props5 = this.props,
        hide = _this$props5.hide,
        className = _this$props5.className,
        points = _this$props5.points,
        isAnimationActive = _this$props5.isAnimationActive;
      if (hide || !points || !points.length) {
        return null;
      }
      var isAnimationFinished = this.state.isAnimationFinished;
      var layerClass = (0, _clsx["default"])('recharts-radar', className);
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: layerClass
      }, this.renderPolygon(), (!isAnimationActive || isAnimationFinished) && _LabelList.LabelList.renderCallByParent(this.props, points));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curPoints: nextProps.points,
          prevPoints: prevState.curPoints
        };
      }
      if (nextProps.points !== prevState.curPoints) {
        return {
          curPoints: nextProps.points
        };
      }
      return null;
    }
  }, {
    key: "renderDotItem",
    value: function renderDotItem(option, props) {
      var dotItem;
      if ( /*#__PURE__*/_react["default"].isValidElement(option)) {
        dotItem = /*#__PURE__*/_react["default"].cloneElement(option, props);
      } else if ((0, _isFunction["default"])(option)) {
        dotItem = option(props);
      } else {
        var key = props.key,
          dotProps = _objectWithoutProperties(props, _excluded);
        dotItem = /*#__PURE__*/_react["default"].createElement(_Dot.Dot, _extends({}, dotProps, {
          key: key,
          className: (0, _clsx["default"])('recharts-radar-dot', typeof option !== 'boolean' ? option.className : '')
        }));
      }
      return dotItem;
    }
  }]);
}(_react.PureComponent);
_defineProperty(Radar, "displayName", 'Radar');
_defineProperty(Radar, "defaultProps", {
  angleAxisId: 0,
  radiusAxisId: 0,
  hide: false,
  activeDot: true,
  dot: false,
  legendType: 'rect',
  isAnimationActive: !_Global.Global.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease'
});
_defineProperty(Radar, "getComposedData", function (_ref2) {
  var radiusAxis = _ref2.radiusAxis,
    angleAxis = _ref2.angleAxis,
    displayedData = _ref2.displayedData,
    dataKey = _ref2.dataKey,
    bandSize = _ref2.bandSize;
  var cx = angleAxis.cx,
    cy = angleAxis.cy;
  var isRange = false;
  var points = [];
  var angleBandSize = angleAxis.type !== 'number' ? bandSize !== null && bandSize !== void 0 ? bandSize : 0 : 0;
  displayedData.forEach(function (entry, i) {
    var name = (0, _ChartUtils.getValueByDataKey)(entry, angleAxis.dataKey, i);
    var value = (0, _ChartUtils.getValueByDataKey)(entry, dataKey);
    var angle = angleAxis.scale(name) + angleBandSize;
    var pointValue = Array.isArray(value) ? (0, _last["default"])(value) : value;
    var radius = (0, _isNil["default"])(pointValue) ? undefined : radiusAxis.scale(pointValue);
    if (Array.isArray(value) && value.length >= 2) {
      isRange = true;
    }
    points.push(_objectSpread(_objectSpread({}, (0, _PolarUtils.polarToCartesian)(cx, cy, radius, angle)), {}, {
      name: name,
      value: value,
      cx: cx,
      cy: cy,
      radius: radius,
      angle: angle,
      payload: entry
    }));
  });
  var baseLinePoints = [];
  if (isRange) {
    points.forEach(function (point) {
      if (Array.isArray(point.value)) {
        var baseValue = (0, _first["default"])(point.value);
        var radius = (0, _isNil["default"])(baseValue) ? undefined : radiusAxis.scale(baseValue);
        baseLinePoints.push(_objectSpread(_objectSpread({}, point), {}, {
          radius: radius
        }, (0, _PolarUtils.polarToCartesian)(cx, cy, radius, point.angle)));
      } else {
        baseLinePoints.push(point);
      }
    });
  }
  return {
    points: points,
    isRange: isRange,
    baseLinePoints: baseLinePoints
  };
});