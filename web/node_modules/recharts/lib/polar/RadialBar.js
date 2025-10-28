"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RadialBar = void 0;
var _react = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _reactSmooth = _interopRequireDefault(require("react-smooth"));
var _isEqual = _interopRequireDefault(require("lodash/isEqual"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _RadialBarUtils = require("../util/RadialBarUtils");
var _Layer = require("../container/Layer");
var _ReactUtils = require("../util/ReactUtils");
var _Global = require("../util/Global");
var _LabelList = require("../component/LabelList");
var _Cell = require("../component/Cell");
var _DataUtils = require("../util/DataUtils");
var _ChartUtils = require("../util/ChartUtils");
var _types = require("../util/types");
var _PolarUtils = require("../util/PolarUtils");
var _excluded = ["shape", "activeShape", "activeIndex", "cornerRadius"],
  _excluded2 = ["value", "background"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
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
 * @fileOverview Render a group of radial bar
 */
// TODO: Cause of circular dependency. Needs refactoring of functions that need them.
// import { AngleAxisProps, RadiusAxisProps } from './types';
var RadialBar = exports.RadialBar = /*#__PURE__*/function (_PureComponent) {
  function RadialBar() {
    var _this;
    _classCallCheck(this, RadialBar);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, RadialBar, [].concat(args));
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
    return _this;
  }
  _inherits(RadialBar, _PureComponent);
  return _createClass(RadialBar, [{
    key: "getDeltaAngle",
    value: function getDeltaAngle() {
      var _this$props = this.props,
        startAngle = _this$props.startAngle,
        endAngle = _this$props.endAngle;
      var sign = (0, _DataUtils.mathSign)(endAngle - startAngle);
      var deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);
      return sign * deltaAngle;
    }
  }, {
    key: "renderSectorsStatically",
    value: function renderSectorsStatically(sectors) {
      var _this2 = this;
      var _this$props2 = this.props,
        shape = _this$props2.shape,
        activeShape = _this$props2.activeShape,
        activeIndex = _this$props2.activeIndex,
        cornerRadius = _this$props2.cornerRadius,
        others = _objectWithoutProperties(_this$props2, _excluded);
      var baseProps = (0, _ReactUtils.filterProps)(others, false);
      return sectors.map(function (entry, i) {
        var isActive = i === activeIndex;
        var props = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, baseProps), {}, {
          cornerRadius: (0, _RadialBarUtils.parseCornerRadius)(cornerRadius)
        }, entry), (0, _types.adaptEventsOfChild)(_this2.props, entry, i)), {}, {
          className: "recharts-radial-bar-sector ".concat(entry.className),
          forceCornerRadius: others.forceCornerRadius,
          cornerIsExternal: others.cornerIsExternal,
          isActive: isActive,
          option: isActive ? activeShape : shape
        });
        return /*#__PURE__*/_react["default"].createElement(_RadialBarUtils.RadialBarSector, _extends({}, props, {
          key: "sector-".concat(i)
        }));
      });
    }
  }, {
    key: "renderSectorsWithAnimation",
    value: function renderSectorsWithAnimation() {
      var _this3 = this;
      var _this$props3 = this.props,
        data = _this$props3.data,
        isAnimationActive = _this$props3.isAnimationActive,
        animationBegin = _this$props3.animationBegin,
        animationDuration = _this$props3.animationDuration,
        animationEasing = _this$props3.animationEasing,
        animationId = _this$props3.animationId;
      var prevData = this.state.prevData;
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
        key: "radialBar-".concat(animationId),
        onAnimationStart: this.handleAnimationStart,
        onAnimationEnd: this.handleAnimationEnd
      }, function (_ref) {
        var t = _ref.t;
        var stepData = data.map(function (entry, index) {
          var prev = prevData && prevData[index];
          if (prev) {
            var interpolatorStartAngle = (0, _DataUtils.interpolateNumber)(prev.startAngle, entry.startAngle);
            var interpolatorEndAngle = (0, _DataUtils.interpolateNumber)(prev.endAngle, entry.endAngle);
            return _objectSpread(_objectSpread({}, entry), {}, {
              startAngle: interpolatorStartAngle(t),
              endAngle: interpolatorEndAngle(t)
            });
          }
          var endAngle = entry.endAngle,
            startAngle = entry.startAngle;
          var interpolator = (0, _DataUtils.interpolateNumber)(startAngle, endAngle);
          return _objectSpread(_objectSpread({}, entry), {}, {
            endAngle: interpolator(t)
          });
        });
        return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, null, _this3.renderSectorsStatically(stepData));
      });
    }
  }, {
    key: "renderSectors",
    value: function renderSectors() {
      var _this$props4 = this.props,
        data = _this$props4.data,
        isAnimationActive = _this$props4.isAnimationActive;
      var prevData = this.state.prevData;
      if (isAnimationActive && data && data.length && (!prevData || !(0, _isEqual["default"])(prevData, data))) {
        return this.renderSectorsWithAnimation();
      }
      return this.renderSectorsStatically(data);
    }
  }, {
    key: "renderBackground",
    value: function renderBackground(sectors) {
      var _this4 = this;
      var cornerRadius = this.props.cornerRadius;
      var backgroundProps = (0, _ReactUtils.filterProps)(this.props.background, false);
      return sectors.map(function (entry, i) {
        var value = entry.value,
          background = entry.background,
          rest = _objectWithoutProperties(entry, _excluded2);
        if (!background) {
          return null;
        }
        var props = _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({
          cornerRadius: (0, _RadialBarUtils.parseCornerRadius)(cornerRadius)
        }, rest), {}, {
          fill: '#eee'
        }, background), backgroundProps), (0, _types.adaptEventsOfChild)(_this4.props, entry, i)), {}, {
          index: i,
          className: (0, _clsx["default"])('recharts-radial-bar-background-sector', backgroundProps === null || backgroundProps === void 0 ? void 0 : backgroundProps.className),
          option: background,
          isActive: false
        });
        return /*#__PURE__*/_react["default"].createElement(_RadialBarUtils.RadialBarSector, _extends({}, props, {
          key: "sector-".concat(i)
        }));
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props5 = this.props,
        hide = _this$props5.hide,
        data = _this$props5.data,
        className = _this$props5.className,
        background = _this$props5.background,
        isAnimationActive = _this$props5.isAnimationActive;
      if (hide || !data || !data.length) {
        return null;
      }
      var isAnimationFinished = this.state.isAnimationFinished;
      var layerClass = (0, _clsx["default"])('recharts-area', className);
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: layerClass
      }, background && /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: "recharts-radial-bar-background"
      }, this.renderBackground(data)), /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: "recharts-radial-bar-sectors"
      }, this.renderSectors()), (!isAnimationActive || isAnimationFinished) && _LabelList.LabelList.renderCallByParent(_objectSpread({}, this.props), data));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curData: nextProps.data,
          prevData: prevState.curData
        };
      }
      if (nextProps.data !== prevState.curData) {
        return {
          curData: nextProps.data
        };
      }
      return null;
    }
  }]);
}(_react.PureComponent);
_defineProperty(RadialBar, "displayName", 'RadialBar');
_defineProperty(RadialBar, "defaultProps", {
  angleAxisId: 0,
  radiusAxisId: 0,
  minPointSize: 0,
  hide: false,
  legendType: 'rect',
  data: [],
  isAnimationActive: !_Global.Global.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  forceCornerRadius: false,
  cornerIsExternal: false
});
_defineProperty(RadialBar, "getComposedData", function (_ref2) {
  var item = _ref2.item,
    props = _ref2.props,
    radiusAxis = _ref2.radiusAxis,
    radiusAxisTicks = _ref2.radiusAxisTicks,
    angleAxis = _ref2.angleAxis,
    angleAxisTicks = _ref2.angleAxisTicks,
    displayedData = _ref2.displayedData,
    dataKey = _ref2.dataKey,
    stackedData = _ref2.stackedData,
    barPosition = _ref2.barPosition,
    bandSize = _ref2.bandSize,
    dataStartIndex = _ref2.dataStartIndex;
  var pos = (0, _ChartUtils.findPositionOfBar)(barPosition, item);
  if (!pos) {
    return null;
  }
  var cx = angleAxis.cx,
    cy = angleAxis.cy;
  var layout = props.layout;
  var _item$props = item.props,
    children = _item$props.children,
    minPointSize = _item$props.minPointSize;
  var numericAxis = layout === 'radial' ? angleAxis : radiusAxis;
  var stackedDomain = stackedData ? numericAxis.scale.domain() : null;
  var baseValue = (0, _ChartUtils.getBaseValueOfBar)({
    numericAxis: numericAxis
  });
  var cells = (0, _ReactUtils.findAllByType)(children, _Cell.Cell);
  var sectors = displayedData.map(function (entry, index) {
    var value, innerRadius, outerRadius, startAngle, endAngle, backgroundSector;
    if (stackedData) {
      value = (0, _ChartUtils.truncateByDomain)(stackedData[dataStartIndex + index], stackedDomain);
    } else {
      value = (0, _ChartUtils.getValueByDataKey)(entry, dataKey);
      if (!Array.isArray(value)) {
        value = [baseValue, value];
      }
    }
    if (layout === 'radial') {
      innerRadius = (0, _ChartUtils.getCateCoordinateOfBar)({
        axis: radiusAxis,
        ticks: radiusAxisTicks,
        bandSize: bandSize,
        offset: pos.offset,
        entry: entry,
        index: index
      });
      endAngle = angleAxis.scale(value[1]);
      startAngle = angleAxis.scale(value[0]);
      outerRadius = innerRadius + pos.size;
      var deltaAngle = endAngle - startAngle;
      if (Math.abs(minPointSize) > 0 && Math.abs(deltaAngle) < Math.abs(minPointSize)) {
        var delta = (0, _DataUtils.mathSign)(deltaAngle || minPointSize) * (Math.abs(minPointSize) - Math.abs(deltaAngle));
        endAngle += delta;
      }
      backgroundSector = {
        background: {
          cx: cx,
          cy: cy,
          innerRadius: innerRadius,
          outerRadius: outerRadius,
          startAngle: props.startAngle,
          endAngle: props.endAngle
        }
      };
    } else {
      innerRadius = radiusAxis.scale(value[0]);
      outerRadius = radiusAxis.scale(value[1]);
      startAngle = (0, _ChartUtils.getCateCoordinateOfBar)({
        axis: angleAxis,
        ticks: angleAxisTicks,
        bandSize: bandSize,
        offset: pos.offset,
        entry: entry,
        index: index
      });
      endAngle = startAngle + pos.size;
      var deltaRadius = outerRadius - innerRadius;
      if (Math.abs(minPointSize) > 0 && Math.abs(deltaRadius) < Math.abs(minPointSize)) {
        var _delta = (0, _DataUtils.mathSign)(deltaRadius || minPointSize) * (Math.abs(minPointSize) - Math.abs(deltaRadius));
        outerRadius += _delta;
      }
    }
    return _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, entry), backgroundSector), {}, {
      payload: entry,
      value: stackedData ? value : value[1],
      cx: cx,
      cy: cy,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      startAngle: startAngle,
      endAngle: endAngle
    }, cells && cells[index] && cells[index].props), {}, {
      tooltipPayload: [(0, _ChartUtils.getTooltipItem)(item, entry)],
      tooltipPosition: (0, _PolarUtils.polarToCartesian)(cx, cy, (innerRadius + outerRadius) / 2, (startAngle + endAngle) / 2)
    });
  });
  return {
    data: sectors,
    layout: layout
  };
});