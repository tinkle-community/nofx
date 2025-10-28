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
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React, { PureComponent } from 'react';
import { getTooltipTranslate } from '../util/tooltip/translate';
var EPSILON = 1;
export var TooltipBoundingBox = /*#__PURE__*/function (_PureComponent) {
  function TooltipBoundingBox() {
    var _this;
    _classCallCheck(this, TooltipBoundingBox);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, TooltipBoundingBox, [].concat(args));
    _defineProperty(_this, "state", {
      dismissed: false,
      dismissedAtCoordinate: {
        x: 0,
        y: 0
      },
      lastBoundingBox: {
        width: -1,
        height: -1
      }
    });
    _defineProperty(_this, "handleKeyDown", function (event) {
      if (event.key === 'Escape') {
        var _this$props$coordinat, _this$props$coordinat2, _this$props$coordinat3, _this$props$coordinat4;
        _this.setState({
          dismissed: true,
          dismissedAtCoordinate: {
            x: (_this$props$coordinat = (_this$props$coordinat2 = _this.props.coordinate) === null || _this$props$coordinat2 === void 0 ? void 0 : _this$props$coordinat2.x) !== null && _this$props$coordinat !== void 0 ? _this$props$coordinat : 0,
            y: (_this$props$coordinat3 = (_this$props$coordinat4 = _this.props.coordinate) === null || _this$props$coordinat4 === void 0 ? void 0 : _this$props$coordinat4.y) !== null && _this$props$coordinat3 !== void 0 ? _this$props$coordinat3 : 0
          }
        });
      }
    });
    return _this;
  }
  _inherits(TooltipBoundingBox, _PureComponent);
  return _createClass(TooltipBoundingBox, [{
    key: "updateBBox",
    value: function updateBBox() {
      if (this.wrapperNode && this.wrapperNode.getBoundingClientRect) {
        var box = this.wrapperNode.getBoundingClientRect();
        if (Math.abs(box.width - this.state.lastBoundingBox.width) > EPSILON || Math.abs(box.height - this.state.lastBoundingBox.height) > EPSILON) {
          this.setState({
            lastBoundingBox: {
              width: box.width,
              height: box.height
            }
          });
        }
      } else if (this.state.lastBoundingBox.width !== -1 || this.state.lastBoundingBox.height !== -1) {
        this.setState({
          lastBoundingBox: {
            width: -1,
            height: -1
          }
        });
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      document.addEventListener('keydown', this.handleKeyDown);
      this.updateBBox();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      var _this$props$coordinat5, _this$props$coordinat6;
      if (this.props.active) {
        this.updateBBox();
      }
      if (!this.state.dismissed) {
        return;
      }
      if (((_this$props$coordinat5 = this.props.coordinate) === null || _this$props$coordinat5 === void 0 ? void 0 : _this$props$coordinat5.x) !== this.state.dismissedAtCoordinate.x || ((_this$props$coordinat6 = this.props.coordinate) === null || _this$props$coordinat6 === void 0 ? void 0 : _this$props$coordinat6.y) !== this.state.dismissedAtCoordinate.y) {
        this.state.dismissed = false;
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;
      var _this$props = this.props,
        active = _this$props.active,
        allowEscapeViewBox = _this$props.allowEscapeViewBox,
        animationDuration = _this$props.animationDuration,
        animationEasing = _this$props.animationEasing,
        children = _this$props.children,
        coordinate = _this$props.coordinate,
        hasPayload = _this$props.hasPayload,
        isAnimationActive = _this$props.isAnimationActive,
        offset = _this$props.offset,
        position = _this$props.position,
        reverseDirection = _this$props.reverseDirection,
        useTranslate3d = _this$props.useTranslate3d,
        viewBox = _this$props.viewBox,
        wrapperStyle = _this$props.wrapperStyle;
      var _getTooltipTranslate = getTooltipTranslate({
          allowEscapeViewBox: allowEscapeViewBox,
          coordinate: coordinate,
          offsetTopLeft: offset,
          position: position,
          reverseDirection: reverseDirection,
          tooltipBox: this.state.lastBoundingBox,
          useTranslate3d: useTranslate3d,
          viewBox: viewBox
        }),
        cssClasses = _getTooltipTranslate.cssClasses,
        cssProperties = _getTooltipTranslate.cssProperties;
      var outerStyle = _objectSpread(_objectSpread({
        transition: isAnimationActive && active ? "transform ".concat(animationDuration, "ms ").concat(animationEasing) : undefined
      }, cssProperties), {}, {
        pointerEvents: 'none',
        visibility: !this.state.dismissed && active && hasPayload ? 'visible' : 'hidden',
        position: 'absolute',
        top: 0,
        left: 0
      }, wrapperStyle);
      return (
        /*#__PURE__*/
        // This element allow listening to the `Escape` key.
        // See https://github.com/recharts/recharts/pull/2925
        React.createElement("div", {
          tabIndex: -1,
          className: cssClasses,
          style: outerStyle,
          ref: function ref(node) {
            _this2.wrapperNode = node;
          }
        }, children)
      );
    }
  }]);
}(PureComponent);