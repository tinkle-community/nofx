"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _fastEquals = require("fast-equals");
var _AnimateManager = _interopRequireDefault(require("./AnimateManager"));
var _easing = require("./easing");
var _configUpdate = _interopRequireDefault(require("./configUpdate"));
var _util = require("./util");
var _excluded = ["children", "begin", "duration", "attributeName", "easing", "isActive", "steps", "from", "to", "canBegin", "onAnimationEnd", "shouldReAnimate", "onAnimationReStart"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var Animate = /*#__PURE__*/function (_PureComponent) {
  _inherits(Animate, _PureComponent);
  var _super = _createSuper(Animate);
  function Animate(props, context) {
    var _this;
    _classCallCheck(this, Animate);
    _this = _super.call(this, props, context);
    var _this$props = _this.props,
      isActive = _this$props.isActive,
      attributeName = _this$props.attributeName,
      from = _this$props.from,
      to = _this$props.to,
      steps = _this$props.steps,
      children = _this$props.children,
      duration = _this$props.duration;
    _this.handleStyleChange = _this.handleStyleChange.bind(_assertThisInitialized(_this));
    _this.changeStyle = _this.changeStyle.bind(_assertThisInitialized(_this));
    if (!isActive || duration <= 0) {
      _this.state = {
        style: {}
      };

      // if children is a function and animation is not active, set style to 'to'
      if (typeof children === 'function') {
        _this.state = {
          style: to
        };
      }
      return _possibleConstructorReturn(_this);
    }
    if (steps && steps.length) {
      _this.state = {
        style: steps[0].style
      };
    } else if (from) {
      if (typeof children === 'function') {
        _this.state = {
          style: from
        };
        return _possibleConstructorReturn(_this);
      }
      _this.state = {
        style: attributeName ? _defineProperty({}, attributeName, from) : from
      };
    } else {
      _this.state = {
        style: {}
      };
    }
    return _this;
  }
  _createClass(Animate, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props2 = this.props,
        isActive = _this$props2.isActive,
        canBegin = _this$props2.canBegin;
      this.mounted = true;
      if (!isActive || !canBegin) {
        return;
      }
      this.runAnimation(this.props);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this$props3 = this.props,
        isActive = _this$props3.isActive,
        canBegin = _this$props3.canBegin,
        attributeName = _this$props3.attributeName,
        shouldReAnimate = _this$props3.shouldReAnimate,
        to = _this$props3.to,
        currentFrom = _this$props3.from;
      var style = this.state.style;
      if (!canBegin) {
        return;
      }
      if (!isActive) {
        var newState = {
          style: attributeName ? _defineProperty({}, attributeName, to) : to
        };
        if (this.state && style) {
          if (attributeName && style[attributeName] !== to || !attributeName && style !== to) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState(newState);
          }
        }
        return;
      }
      if ((0, _fastEquals.deepEqual)(prevProps.to, to) && prevProps.canBegin && prevProps.isActive) {
        return;
      }
      var isTriggered = !prevProps.canBegin || !prevProps.isActive;
      if (this.manager) {
        this.manager.stop();
      }
      if (this.stopJSAnimation) {
        this.stopJSAnimation();
      }
      var from = isTriggered || shouldReAnimate ? currentFrom : prevProps.to;
      if (this.state && style) {
        var _newState = {
          style: attributeName ? _defineProperty({}, attributeName, from) : from
        };
        if (attributeName && style[attributeName] !== from || !attributeName && style !== from) {
          // eslint-disable-next-line react/no-did-update-set-state
          this.setState(_newState);
        }
      }
      this.runAnimation(_objectSpread(_objectSpread({}, this.props), {}, {
        from: from,
        begin: 0
      }));
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.mounted = false;
      var onAnimationEnd = this.props.onAnimationEnd;
      if (this.unSubscribe) {
        this.unSubscribe();
      }
      if (this.manager) {
        this.manager.stop();
        this.manager = null;
      }
      if (this.stopJSAnimation) {
        this.stopJSAnimation();
      }
      if (onAnimationEnd) {
        onAnimationEnd();
      }
    }
  }, {
    key: "handleStyleChange",
    value: function handleStyleChange(style) {
      this.changeStyle(style);
    }
  }, {
    key: "changeStyle",
    value: function changeStyle(style) {
      if (this.mounted) {
        this.setState({
          style: style
        });
      }
    }
  }, {
    key: "runJSAnimation",
    value: function runJSAnimation(props) {
      var _this2 = this;
      var from = props.from,
        to = props.to,
        duration = props.duration,
        easing = props.easing,
        begin = props.begin,
        onAnimationEnd = props.onAnimationEnd,
        onAnimationStart = props.onAnimationStart;
      var startAnimation = (0, _configUpdate.default)(from, to, (0, _easing.configEasing)(easing), duration, this.changeStyle);
      var finalStartAnimation = function finalStartAnimation() {
        _this2.stopJSAnimation = startAnimation();
      };
      this.manager.start([onAnimationStart, begin, finalStartAnimation, duration, onAnimationEnd]);
    }
  }, {
    key: "runStepAnimation",
    value: function runStepAnimation(props) {
      var _this3 = this;
      var steps = props.steps,
        begin = props.begin,
        onAnimationStart = props.onAnimationStart;
      var _steps$ = steps[0],
        initialStyle = _steps$.style,
        _steps$$duration = _steps$.duration,
        initialTime = _steps$$duration === void 0 ? 0 : _steps$$duration;
      var addStyle = function addStyle(sequence, nextItem, index) {
        if (index === 0) {
          return sequence;
        }
        var duration = nextItem.duration,
          _nextItem$easing = nextItem.easing,
          easing = _nextItem$easing === void 0 ? 'ease' : _nextItem$easing,
          style = nextItem.style,
          nextProperties = nextItem.properties,
          onAnimationEnd = nextItem.onAnimationEnd;
        var preItem = index > 0 ? steps[index - 1] : nextItem;
        var properties = nextProperties || Object.keys(style);
        if (typeof easing === 'function' || easing === 'spring') {
          return [].concat(_toConsumableArray(sequence), [_this3.runJSAnimation.bind(_this3, {
            from: preItem.style,
            to: style,
            duration: duration,
            easing: easing
          }), duration]);
        }
        var transition = (0, _util.getTransitionVal)(properties, duration, easing);
        var newStyle = _objectSpread(_objectSpread(_objectSpread({}, preItem.style), style), {}, {
          transition: transition
        });
        return [].concat(_toConsumableArray(sequence), [newStyle, duration, onAnimationEnd]).filter(_util.identity);
      };
      return this.manager.start([onAnimationStart].concat(_toConsumableArray(steps.reduce(addStyle, [initialStyle, Math.max(initialTime, begin)])), [props.onAnimationEnd]));
    }
  }, {
    key: "runAnimation",
    value: function runAnimation(props) {
      if (!this.manager) {
        this.manager = (0, _AnimateManager.default)();
      }
      var begin = props.begin,
        duration = props.duration,
        attributeName = props.attributeName,
        propsTo = props.to,
        easing = props.easing,
        onAnimationStart = props.onAnimationStart,
        onAnimationEnd = props.onAnimationEnd,
        steps = props.steps,
        children = props.children;
      var manager = this.manager;
      this.unSubscribe = manager.subscribe(this.handleStyleChange);
      if (typeof easing === 'function' || typeof children === 'function' || easing === 'spring') {
        this.runJSAnimation(props);
        return;
      }
      if (steps.length > 1) {
        this.runStepAnimation(props);
        return;
      }
      var to = attributeName ? _defineProperty({}, attributeName, propsTo) : propsTo;
      var transition = (0, _util.getTransitionVal)(Object.keys(to), duration, easing);
      manager.start([onAnimationStart, begin, _objectSpread(_objectSpread({}, to), {}, {
        transition: transition
      }), duration, onAnimationEnd]);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
        children = _this$props4.children,
        begin = _this$props4.begin,
        duration = _this$props4.duration,
        attributeName = _this$props4.attributeName,
        easing = _this$props4.easing,
        isActive = _this$props4.isActive,
        steps = _this$props4.steps,
        from = _this$props4.from,
        to = _this$props4.to,
        canBegin = _this$props4.canBegin,
        onAnimationEnd = _this$props4.onAnimationEnd,
        shouldReAnimate = _this$props4.shouldReAnimate,
        onAnimationReStart = _this$props4.onAnimationReStart,
        others = _objectWithoutProperties(_this$props4, _excluded);
      var count = _react.Children.count(children);
      // eslint-disable-next-line react/destructuring-assignment
      var stateStyle = this.state.style;
      if (typeof children === 'function') {
        return children(stateStyle);
      }
      if (!isActive || count === 0 || duration <= 0) {
        return children;
      }
      var cloneContainer = function cloneContainer(container) {
        var _container$props = container.props,
          _container$props$styl = _container$props.style,
          style = _container$props$styl === void 0 ? {} : _container$props$styl,
          className = _container$props.className;
        var res = /*#__PURE__*/(0, _react.cloneElement)(container, _objectSpread(_objectSpread({}, others), {}, {
          style: _objectSpread(_objectSpread({}, style), stateStyle),
          className: className
        }));
        return res;
      };
      if (count === 1) {
        return cloneContainer(_react.Children.only(children));
      }
      return /*#__PURE__*/_react.default.createElement("div", null, _react.Children.map(children, function (child) {
        return cloneContainer(child);
      }));
    }
  }]);
  return Animate;
}(_react.PureComponent);
Animate.displayName = 'Animate';
Animate.defaultProps = {
  begin: 0,
  duration: 1000,
  from: '',
  to: '',
  attributeName: '',
  easing: 'ease',
  isActive: true,
  canBegin: true,
  steps: [],
  onAnimationEnd: function onAnimationEnd() {},
  onAnimationStart: function onAnimationStart() {}
};
Animate.propTypes = {
  from: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.string]),
  to: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.string]),
  attributeName: _propTypes.default.string,
  // animation duration
  duration: _propTypes.default.number,
  begin: _propTypes.default.number,
  easing: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),
  steps: _propTypes.default.arrayOf(_propTypes.default.shape({
    duration: _propTypes.default.number.isRequired,
    style: _propTypes.default.object.isRequired,
    easing: _propTypes.default.oneOfType([_propTypes.default.oneOf(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']), _propTypes.default.func]),
    // transition css properties(dash case), optional
    properties: _propTypes.default.arrayOf('string'),
    onAnimationEnd: _propTypes.default.func
  })),
  children: _propTypes.default.oneOfType([_propTypes.default.node, _propTypes.default.func]),
  isActive: _propTypes.default.bool,
  canBegin: _propTypes.default.bool,
  onAnimationEnd: _propTypes.default.func,
  // decide if it should reanimate with initial from style when props change
  shouldReAnimate: _propTypes.default.bool,
  onAnimationStart: _propTypes.default.func,
  onAnimationReStart: _propTypes.default.func
};
var _default = exports.default = Animate;