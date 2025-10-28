"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Brush = void 0;
var _react = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _d3Scale = require("victory-vendor/d3-scale");
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _range = _interopRequireDefault(require("lodash/range"));
var _Layer = require("../container/Layer");
var _Text = require("../component/Text");
var _ChartUtils = require("../util/ChartUtils");
var _DataUtils = require("../util/DataUtils");
var _CssPrefixUtils = require("../util/CssPrefixUtils");
var _ReactUtils = require("../util/ReactUtils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
 * @fileOverview Brush
 */
var createScale = function createScale(_ref) {
  var data = _ref.data,
    startIndex = _ref.startIndex,
    endIndex = _ref.endIndex,
    x = _ref.x,
    width = _ref.width,
    travellerWidth = _ref.travellerWidth;
  if (!data || !data.length) {
    return {};
  }
  var len = data.length;
  var scale = (0, _d3Scale.scalePoint)().domain((0, _range["default"])(0, len)).range([x, x + width - travellerWidth]);
  var scaleValues = scale.domain().map(function (entry) {
    return scale(entry);
  });
  return {
    isTextActive: false,
    isSlideMoving: false,
    isTravellerMoving: false,
    isTravellerFocused: false,
    startX: scale(startIndex),
    endX: scale(endIndex),
    scale: scale,
    scaleValues: scaleValues
  };
};
var isTouch = function isTouch(e) {
  return e.changedTouches && !!e.changedTouches.length;
};
var Brush = exports.Brush = /*#__PURE__*/function (_PureComponent) {
  function Brush(props) {
    var _this;
    _classCallCheck(this, Brush);
    _this = _callSuper(this, Brush, [props]);
    _defineProperty(_this, "handleDrag", function (e) {
      if (_this.leaveTimer) {
        clearTimeout(_this.leaveTimer);
        _this.leaveTimer = null;
      }
      if (_this.state.isTravellerMoving) {
        _this.handleTravellerMove(e);
      } else if (_this.state.isSlideMoving) {
        _this.handleSlideDrag(e);
      }
    });
    _defineProperty(_this, "handleTouchMove", function (e) {
      if (e.changedTouches != null && e.changedTouches.length > 0) {
        _this.handleDrag(e.changedTouches[0]);
      }
    });
    _defineProperty(_this, "handleDragEnd", function () {
      _this.setState({
        isTravellerMoving: false,
        isSlideMoving: false
      }, function () {
        var _this$props = _this.props,
          endIndex = _this$props.endIndex,
          onDragEnd = _this$props.onDragEnd,
          startIndex = _this$props.startIndex;
        onDragEnd === null || onDragEnd === void 0 || onDragEnd({
          endIndex: endIndex,
          startIndex: startIndex
        });
      });
      _this.detachDragEndListener();
    });
    _defineProperty(_this, "handleLeaveWrapper", function () {
      if (_this.state.isTravellerMoving || _this.state.isSlideMoving) {
        _this.leaveTimer = window.setTimeout(_this.handleDragEnd, _this.props.leaveTimeOut);
      }
    });
    _defineProperty(_this, "handleEnterSlideOrTraveller", function () {
      _this.setState({
        isTextActive: true
      });
    });
    _defineProperty(_this, "handleLeaveSlideOrTraveller", function () {
      _this.setState({
        isTextActive: false
      });
    });
    _defineProperty(_this, "handleSlideDragStart", function (e) {
      var event = isTouch(e) ? e.changedTouches[0] : e;
      _this.setState({
        isTravellerMoving: false,
        isSlideMoving: true,
        slideMoveStartX: event.pageX
      });
      _this.attachDragEndListener();
    });
    _this.travellerDragStartHandlers = {
      startX: _this.handleTravellerDragStart.bind(_this, 'startX'),
      endX: _this.handleTravellerDragStart.bind(_this, 'endX')
    };
    _this.state = {};
    return _this;
  }
  _inherits(Brush, _PureComponent);
  return _createClass(Brush, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer);
        this.leaveTimer = null;
      }
      this.detachDragEndListener();
    }
  }, {
    key: "getIndex",
    value: function getIndex(_ref2) {
      var startX = _ref2.startX,
        endX = _ref2.endX;
      var scaleValues = this.state.scaleValues;
      var _this$props2 = this.props,
        gap = _this$props2.gap,
        data = _this$props2.data;
      var lastIndex = data.length - 1;
      var min = Math.min(startX, endX);
      var max = Math.max(startX, endX);
      var minIndex = Brush.getIndexInRange(scaleValues, min);
      var maxIndex = Brush.getIndexInRange(scaleValues, max);
      return {
        startIndex: minIndex - minIndex % gap,
        endIndex: maxIndex === lastIndex ? lastIndex : maxIndex - maxIndex % gap
      };
    }
  }, {
    key: "getTextOfTick",
    value: function getTextOfTick(index) {
      var _this$props3 = this.props,
        data = _this$props3.data,
        tickFormatter = _this$props3.tickFormatter,
        dataKey = _this$props3.dataKey;
      var text = (0, _ChartUtils.getValueByDataKey)(data[index], dataKey, index);
      return (0, _isFunction["default"])(tickFormatter) ? tickFormatter(text, index) : text;
    }
  }, {
    key: "attachDragEndListener",
    value: function attachDragEndListener() {
      window.addEventListener('mouseup', this.handleDragEnd, true);
      window.addEventListener('touchend', this.handleDragEnd, true);
      window.addEventListener('mousemove', this.handleDrag, true);
    }
  }, {
    key: "detachDragEndListener",
    value: function detachDragEndListener() {
      window.removeEventListener('mouseup', this.handleDragEnd, true);
      window.removeEventListener('touchend', this.handleDragEnd, true);
      window.removeEventListener('mousemove', this.handleDrag, true);
    }
  }, {
    key: "handleSlideDrag",
    value: function handleSlideDrag(e) {
      var _this$state = this.state,
        slideMoveStartX = _this$state.slideMoveStartX,
        startX = _this$state.startX,
        endX = _this$state.endX;
      var _this$props4 = this.props,
        x = _this$props4.x,
        width = _this$props4.width,
        travellerWidth = _this$props4.travellerWidth,
        startIndex = _this$props4.startIndex,
        endIndex = _this$props4.endIndex,
        onChange = _this$props4.onChange;
      var delta = e.pageX - slideMoveStartX;
      if (delta > 0) {
        delta = Math.min(delta, x + width - travellerWidth - endX, x + width - travellerWidth - startX);
      } else if (delta < 0) {
        delta = Math.max(delta, x - startX, x - endX);
      }
      var newIndex = this.getIndex({
        startX: startX + delta,
        endX: endX + delta
      });
      if ((newIndex.startIndex !== startIndex || newIndex.endIndex !== endIndex) && onChange) {
        onChange(newIndex);
      }
      this.setState({
        startX: startX + delta,
        endX: endX + delta,
        slideMoveStartX: e.pageX
      });
    }
  }, {
    key: "handleTravellerDragStart",
    value: function handleTravellerDragStart(id, e) {
      var event = isTouch(e) ? e.changedTouches[0] : e;
      this.setState({
        isSlideMoving: false,
        isTravellerMoving: true,
        movingTravellerId: id,
        brushMoveStartX: event.pageX
      });
      this.attachDragEndListener();
    }
  }, {
    key: "handleTravellerMove",
    value: function handleTravellerMove(e) {
      var _this$state2 = this.state,
        brushMoveStartX = _this$state2.brushMoveStartX,
        movingTravellerId = _this$state2.movingTravellerId,
        endX = _this$state2.endX,
        startX = _this$state2.startX;
      var prevValue = this.state[movingTravellerId];
      var _this$props5 = this.props,
        x = _this$props5.x,
        width = _this$props5.width,
        travellerWidth = _this$props5.travellerWidth,
        onChange = _this$props5.onChange,
        gap = _this$props5.gap,
        data = _this$props5.data;
      var params = {
        startX: this.state.startX,
        endX: this.state.endX
      };
      var delta = e.pageX - brushMoveStartX;
      if (delta > 0) {
        delta = Math.min(delta, x + width - travellerWidth - prevValue);
      } else if (delta < 0) {
        delta = Math.max(delta, x - prevValue);
      }
      params[movingTravellerId] = prevValue + delta;
      var newIndex = this.getIndex(params);
      var startIndex = newIndex.startIndex,
        endIndex = newIndex.endIndex;
      var isFullGap = function isFullGap() {
        var lastIndex = data.length - 1;
        if (movingTravellerId === 'startX' && (endX > startX ? startIndex % gap === 0 : endIndex % gap === 0) || endX < startX && endIndex === lastIndex || movingTravellerId === 'endX' && (endX > startX ? endIndex % gap === 0 : startIndex % gap === 0) || endX > startX && endIndex === lastIndex) {
          return true;
        }
        return false;
      };
      this.setState(_defineProperty(_defineProperty({}, movingTravellerId, prevValue + delta), "brushMoveStartX", e.pageX), function () {
        if (onChange) {
          if (isFullGap()) {
            onChange(newIndex);
          }
        }
      });
    }
  }, {
    key: "handleTravellerMoveKeyboard",
    value: function handleTravellerMoveKeyboard(direction, id) {
      var _this2 = this;
      // scaleValues are a list of coordinates. For example: [65, 250, 435, 620, 805, 990].
      var _this$state3 = this.state,
        scaleValues = _this$state3.scaleValues,
        startX = _this$state3.startX,
        endX = _this$state3.endX;
      // currentScaleValue refers to which coordinate the current traveller should be placed at.
      var currentScaleValue = this.state[id];
      var currentIndex = scaleValues.indexOf(currentScaleValue);
      if (currentIndex === -1) {
        return;
      }
      var newIndex = currentIndex + direction;
      if (newIndex === -1 || newIndex >= scaleValues.length) {
        return;
      }
      var newScaleValue = scaleValues[newIndex];

      // Prevent travellers from being on top of each other or overlapping
      if (id === 'startX' && newScaleValue >= endX || id === 'endX' && newScaleValue <= startX) {
        return;
      }
      this.setState(_defineProperty({}, id, newScaleValue), function () {
        _this2.props.onChange(_this2.getIndex({
          startX: _this2.state.startX,
          endX: _this2.state.endX
        }));
      });
    }
  }, {
    key: "renderBackground",
    value: function renderBackground() {
      var _this$props6 = this.props,
        x = _this$props6.x,
        y = _this$props6.y,
        width = _this$props6.width,
        height = _this$props6.height,
        fill = _this$props6.fill,
        stroke = _this$props6.stroke;
      return /*#__PURE__*/_react["default"].createElement("rect", {
        stroke: stroke,
        fill: fill,
        x: x,
        y: y,
        width: width,
        height: height
      });
    }
  }, {
    key: "renderPanorama",
    value: function renderPanorama() {
      var _this$props7 = this.props,
        x = _this$props7.x,
        y = _this$props7.y,
        width = _this$props7.width,
        height = _this$props7.height,
        data = _this$props7.data,
        children = _this$props7.children,
        padding = _this$props7.padding;
      var chartElement = _react.Children.only(children);
      if (!chartElement) {
        return null;
      }
      return /*#__PURE__*/_react["default"].cloneElement(chartElement, {
        x: x,
        y: y,
        width: width,
        height: height,
        margin: padding,
        compact: true,
        data: data
      });
    }
  }, {
    key: "renderTravellerLayer",
    value: function renderTravellerLayer(travellerX, id) {
      var _data$startIndex,
        _data$endIndex,
        _this3 = this;
      var _this$props8 = this.props,
        y = _this$props8.y,
        travellerWidth = _this$props8.travellerWidth,
        height = _this$props8.height,
        traveller = _this$props8.traveller,
        ariaLabel = _this$props8.ariaLabel,
        data = _this$props8.data,
        startIndex = _this$props8.startIndex,
        endIndex = _this$props8.endIndex;
      var x = Math.max(travellerX, this.props.x);
      var travellerProps = _objectSpread(_objectSpread({}, (0, _ReactUtils.filterProps)(this.props, false)), {}, {
        x: x,
        y: y,
        width: travellerWidth,
        height: height
      });
      var ariaLabelBrush = ariaLabel || "Min value: ".concat((_data$startIndex = data[startIndex]) === null || _data$startIndex === void 0 ? void 0 : _data$startIndex.name, ", Max value: ").concat((_data$endIndex = data[endIndex]) === null || _data$endIndex === void 0 ? void 0 : _data$endIndex.name);
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        tabIndex: 0,
        role: "slider",
        "aria-label": ariaLabelBrush,
        "aria-valuenow": travellerX,
        className: "recharts-brush-traveller",
        onMouseEnter: this.handleEnterSlideOrTraveller,
        onMouseLeave: this.handleLeaveSlideOrTraveller,
        onMouseDown: this.travellerDragStartHandlers[id],
        onTouchStart: this.travellerDragStartHandlers[id],
        onKeyDown: function onKeyDown(e) {
          if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          _this3.handleTravellerMoveKeyboard(e.key === 'ArrowRight' ? 1 : -1, id);
        },
        onFocus: function onFocus() {
          _this3.setState({
            isTravellerFocused: true
          });
        },
        onBlur: function onBlur() {
          _this3.setState({
            isTravellerFocused: false
          });
        },
        style: {
          cursor: 'col-resize'
        }
      }, Brush.renderTraveller(traveller, travellerProps));
    }
  }, {
    key: "renderSlide",
    value: function renderSlide(startX, endX) {
      var _this$props9 = this.props,
        y = _this$props9.y,
        height = _this$props9.height,
        stroke = _this$props9.stroke,
        travellerWidth = _this$props9.travellerWidth;
      var x = Math.min(startX, endX) + travellerWidth;
      var width = Math.max(Math.abs(endX - startX) - travellerWidth, 0);
      return /*#__PURE__*/_react["default"].createElement("rect", {
        className: "recharts-brush-slide",
        onMouseEnter: this.handleEnterSlideOrTraveller,
        onMouseLeave: this.handleLeaveSlideOrTraveller,
        onMouseDown: this.handleSlideDragStart,
        onTouchStart: this.handleSlideDragStart,
        style: {
          cursor: 'move'
        },
        stroke: "none",
        fill: stroke,
        fillOpacity: 0.2,
        x: x,
        y: y,
        width: width,
        height: height
      });
    }
  }, {
    key: "renderText",
    value: function renderText() {
      var _this$props10 = this.props,
        startIndex = _this$props10.startIndex,
        endIndex = _this$props10.endIndex,
        y = _this$props10.y,
        height = _this$props10.height,
        travellerWidth = _this$props10.travellerWidth,
        stroke = _this$props10.stroke;
      var _this$state4 = this.state,
        startX = _this$state4.startX,
        endX = _this$state4.endX;
      var offset = 5;
      var attrs = {
        pointerEvents: 'none',
        fill: stroke
      };
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: "recharts-brush-texts"
      }, /*#__PURE__*/_react["default"].createElement(_Text.Text, _extends({
        textAnchor: "end",
        verticalAnchor: "middle",
        x: Math.min(startX, endX) - offset,
        y: y + height / 2
      }, attrs), this.getTextOfTick(startIndex)), /*#__PURE__*/_react["default"].createElement(_Text.Text, _extends({
        textAnchor: "start",
        verticalAnchor: "middle",
        x: Math.max(startX, endX) + travellerWidth + offset,
        y: y + height / 2
      }, attrs), this.getTextOfTick(endIndex)));
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props11 = this.props,
        data = _this$props11.data,
        className = _this$props11.className,
        children = _this$props11.children,
        x = _this$props11.x,
        y = _this$props11.y,
        width = _this$props11.width,
        height = _this$props11.height,
        alwaysShowText = _this$props11.alwaysShowText;
      var _this$state5 = this.state,
        startX = _this$state5.startX,
        endX = _this$state5.endX,
        isTextActive = _this$state5.isTextActive,
        isSlideMoving = _this$state5.isSlideMoving,
        isTravellerMoving = _this$state5.isTravellerMoving,
        isTravellerFocused = _this$state5.isTravellerFocused;
      if (!data || !data.length || !(0, _DataUtils.isNumber)(x) || !(0, _DataUtils.isNumber)(y) || !(0, _DataUtils.isNumber)(width) || !(0, _DataUtils.isNumber)(height) || width <= 0 || height <= 0) {
        return null;
      }
      var layerClass = (0, _clsx["default"])('recharts-brush', className);
      var isPanoramic = _react["default"].Children.count(children) === 1;
      var style = (0, _CssPrefixUtils.generatePrefixStyle)('userSelect', 'none');
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: layerClass,
        onMouseLeave: this.handleLeaveWrapper,
        onTouchMove: this.handleTouchMove,
        style: style
      }, this.renderBackground(), isPanoramic && this.renderPanorama(), this.renderSlide(startX, endX), this.renderTravellerLayer(startX, 'startX'), this.renderTravellerLayer(endX, 'endX'), (isTextActive || isSlideMoving || isTravellerMoving || isTravellerFocused || alwaysShowText) && this.renderText());
    }
  }], [{
    key: "renderDefaultTraveller",
    value: function renderDefaultTraveller(props) {
      var x = props.x,
        y = props.y,
        width = props.width,
        height = props.height,
        stroke = props.stroke;
      var lineY = Math.floor(y + height / 2) - 1;
      return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("rect", {
        x: x,
        y: y,
        width: width,
        height: height,
        fill: stroke,
        stroke: "none"
      }), /*#__PURE__*/_react["default"].createElement("line", {
        x1: x + 1,
        y1: lineY,
        x2: x + width - 1,
        y2: lineY,
        fill: "none",
        stroke: "#fff"
      }), /*#__PURE__*/_react["default"].createElement("line", {
        x1: x + 1,
        y1: lineY + 2,
        x2: x + width - 1,
        y2: lineY + 2,
        fill: "none",
        stroke: "#fff"
      }));
    }
  }, {
    key: "renderTraveller",
    value: function renderTraveller(option, props) {
      var rectangle;
      if ( /*#__PURE__*/_react["default"].isValidElement(option)) {
        rectangle = /*#__PURE__*/_react["default"].cloneElement(option, props);
      } else if ((0, _isFunction["default"])(option)) {
        rectangle = option(props);
      } else {
        rectangle = Brush.renderDefaultTraveller(props);
      }
      return rectangle;
    }
  }, {
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      var data = nextProps.data,
        width = nextProps.width,
        x = nextProps.x,
        travellerWidth = nextProps.travellerWidth,
        updateId = nextProps.updateId,
        startIndex = nextProps.startIndex,
        endIndex = nextProps.endIndex;
      if (data !== prevState.prevData || updateId !== prevState.prevUpdateId) {
        return _objectSpread({
          prevData: data,
          prevTravellerWidth: travellerWidth,
          prevUpdateId: updateId,
          prevX: x,
          prevWidth: width
        }, data && data.length ? createScale({
          data: data,
          width: width,
          x: x,
          travellerWidth: travellerWidth,
          startIndex: startIndex,
          endIndex: endIndex
        }) : {
          scale: null,
          scaleValues: null
        });
      }
      if (prevState.scale && (width !== prevState.prevWidth || x !== prevState.prevX || travellerWidth !== prevState.prevTravellerWidth)) {
        prevState.scale.range([x, x + width - travellerWidth]);
        var scaleValues = prevState.scale.domain().map(function (entry) {
          return prevState.scale(entry);
        });
        return {
          prevData: data,
          prevTravellerWidth: travellerWidth,
          prevUpdateId: updateId,
          prevX: x,
          prevWidth: width,
          startX: prevState.scale(nextProps.startIndex),
          endX: prevState.scale(nextProps.endIndex),
          scaleValues: scaleValues
        };
      }
      return null;
    }
  }, {
    key: "getIndexInRange",
    value: function getIndexInRange(valueRange, x) {
      var len = valueRange.length;
      var start = 0;
      var end = len - 1;
      while (end - start > 1) {
        var middle = Math.floor((start + end) / 2);
        if (valueRange[middle] > x) {
          end = middle;
        } else {
          start = middle;
        }
      }
      return x >= valueRange[end] ? end : start;
    }
  }]);
}(_react.PureComponent);
_defineProperty(Brush, "displayName", 'Brush');
_defineProperty(Brush, "defaultProps", {
  height: 40,
  travellerWidth: 5,
  gap: 1,
  fill: '#fff',
  stroke: '#666',
  padding: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  },
  leaveTimeOut: 1000,
  alwaysShowText: false
});