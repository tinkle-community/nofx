"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrorBar = void 0;
var _react = _interopRequireDefault(require("react"));
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _Layer = require("../container/Layer");
var _ReactUtils = require("../util/ReactUtils");
var _excluded = ["offset", "layout", "width", "dataKey", "data", "dataPointFormatter", "xAxis", "yAxis"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
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
 * @fileOverview Render a group of error bar
 */
// eslint-disable-next-line react/prefer-stateless-function -- requires static defaultProps
var ErrorBar = exports.ErrorBar = /*#__PURE__*/function (_React$Component) {
  function ErrorBar() {
    _classCallCheck(this, ErrorBar);
    return _callSuper(this, ErrorBar, arguments);
  }
  _inherits(ErrorBar, _React$Component);
  return _createClass(ErrorBar, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
        offset = _this$props.offset,
        layout = _this$props.layout,
        width = _this$props.width,
        dataKey = _this$props.dataKey,
        data = _this$props.data,
        dataPointFormatter = _this$props.dataPointFormatter,
        xAxis = _this$props.xAxis,
        yAxis = _this$props.yAxis,
        others = _objectWithoutProperties(_this$props, _excluded);
      var svgProps = (0, _ReactUtils.filterProps)(others, false);
      !!(this.props.direction === 'x' && xAxis.type !== 'number') ? process.env.NODE_ENV !== "production" ? (0, _tinyInvariant["default"])(false, 'ErrorBar requires Axis type property to be "number".') : (0, _tinyInvariant["default"])(false) : void 0;
      var errorBars = data.map(function (entry) {
        var _dataPointFormatter = dataPointFormatter(entry, dataKey),
          x = _dataPointFormatter.x,
          y = _dataPointFormatter.y,
          value = _dataPointFormatter.value,
          errorVal = _dataPointFormatter.errorVal;
        if (!errorVal) {
          return null;
        }
        var lineCoordinates = [];
        var lowBound, highBound;
        if (Array.isArray(errorVal)) {
          var _errorVal = _slicedToArray(errorVal, 2);
          lowBound = _errorVal[0];
          highBound = _errorVal[1];
        } else {
          lowBound = highBound = errorVal;
        }
        if (layout === 'vertical') {
          // error bar for horizontal charts, the y is fixed, x is a range value
          var scale = xAxis.scale;
          var yMid = y + offset;
          var yMin = yMid + width;
          var yMax = yMid - width;
          var xMin = scale(value - lowBound);
          var xMax = scale(value + highBound);

          // the right line of |--|
          lineCoordinates.push({
            x1: xMax,
            y1: yMin,
            x2: xMax,
            y2: yMax
          });
          // the middle line of |--|
          lineCoordinates.push({
            x1: xMin,
            y1: yMid,
            x2: xMax,
            y2: yMid
          });
          // the left line of |--|
          lineCoordinates.push({
            x1: xMin,
            y1: yMin,
            x2: xMin,
            y2: yMax
          });
        } else if (layout === 'horizontal') {
          // error bar for horizontal charts, the x is fixed, y is a range value
          var _scale = yAxis.scale;
          var xMid = x + offset;
          var _xMin = xMid - width;
          var _xMax = xMid + width;
          var _yMin = _scale(value - lowBound);
          var _yMax = _scale(value + highBound);

          // the top line
          lineCoordinates.push({
            x1: _xMin,
            y1: _yMax,
            x2: _xMax,
            y2: _yMax
          });
          // the middle line
          lineCoordinates.push({
            x1: xMid,
            y1: _yMin,
            x2: xMid,
            y2: _yMax
          });
          // the bottom line
          lineCoordinates.push({
            x1: _xMin,
            y1: _yMin,
            x2: _xMax,
            y2: _yMin
          });
        }
        return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, _extends({
          className: "recharts-errorBar",
          key: "bar-".concat(lineCoordinates.map(function (c) {
            return "".concat(c.x1, "-").concat(c.x2, "-").concat(c.y1, "-").concat(c.y2);
          }))
        }, svgProps), lineCoordinates.map(function (coordinates) {
          return /*#__PURE__*/_react["default"].createElement("line", _extends({}, coordinates, {
            key: "line-".concat(coordinates.x1, "-").concat(coordinates.x2, "-").concat(coordinates.y1, "-").concat(coordinates.y2)
          }));
        }));
      });
      return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
        className: "recharts-errorBars"
      }, errorBars);
    }
  }]);
}(_react["default"].Component);
_defineProperty(ErrorBar, "defaultProps", {
  stroke: 'black',
  strokeWidth: 1.5,
  width: 5,
  offset: 0,
  layout: 'horizontal'
});
_defineProperty(ErrorBar, "displayName", 'ErrorBar');