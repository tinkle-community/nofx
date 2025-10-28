"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LabelList = LabelList;
var _react = _interopRequireWildcard(require("react"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _isObject = _interopRequireDefault(require("lodash/isObject"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _last = _interopRequireDefault(require("lodash/last"));
var _Label = require("./Label");
var _Layer = require("../container/Layer");
var _ReactUtils = require("../util/ReactUtils");
var _ChartUtils = require("../util/ChartUtils");
var _excluded = ["valueAccessor"],
  _excluded2 = ["data", "dataKey", "clockWise", "id", "textBreakAll"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
var defaultAccessor = function defaultAccessor(entry) {
  return Array.isArray(entry.value) ? (0, _last["default"])(entry.value) : entry.value;
};
function LabelList(_ref) {
  var _ref$valueAccessor = _ref.valueAccessor,
    valueAccessor = _ref$valueAccessor === void 0 ? defaultAccessor : _ref$valueAccessor,
    restProps = _objectWithoutProperties(_ref, _excluded);
  var data = restProps.data,
    dataKey = restProps.dataKey,
    clockWise = restProps.clockWise,
    id = restProps.id,
    textBreakAll = restProps.textBreakAll,
    others = _objectWithoutProperties(restProps, _excluded2);
  if (!data || !data.length) {
    return null;
  }
  return /*#__PURE__*/_react["default"].createElement(_Layer.Layer, {
    className: "recharts-label-list"
  }, data.map(function (entry, index) {
    var value = (0, _isNil["default"])(dataKey) ? valueAccessor(entry, index) : (0, _ChartUtils.getValueByDataKey)(entry && entry.payload, dataKey);
    var idProps = (0, _isNil["default"])(id) ? {} : {
      id: "".concat(id, "-").concat(index)
    };
    return /*#__PURE__*/_react["default"].createElement(_Label.Label, _extends({}, (0, _ReactUtils.filterProps)(entry, true), others, idProps, {
      parentViewBox: entry.parentViewBox,
      value: value,
      textBreakAll: textBreakAll,
      viewBox: _Label.Label.parseViewBox((0, _isNil["default"])(clockWise) ? entry : _objectSpread(_objectSpread({}, entry), {}, {
        clockWise: clockWise
      })),
      key: "label-".concat(index) // eslint-disable-line react/no-array-index-key
      ,
      index: index
    }));
  }));
}
LabelList.displayName = 'LabelList';
function parseLabelList(label, data) {
  if (!label) {
    return null;
  }
  if (label === true) {
    return /*#__PURE__*/_react["default"].createElement(LabelList, {
      key: "labelList-implicit",
      data: data
    });
  }
  if ( /*#__PURE__*/_react["default"].isValidElement(label) || (0, _isFunction["default"])(label)) {
    return /*#__PURE__*/_react["default"].createElement(LabelList, {
      key: "labelList-implicit",
      data: data,
      content: label
    });
  }
  if ((0, _isObject["default"])(label)) {
    return /*#__PURE__*/_react["default"].createElement(LabelList, _extends({
      data: data
    }, label, {
      key: "labelList-implicit"
    }));
  }
  return null;
}
function renderCallByParent(parentProps, data) {
  var checkPropsLabel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  if (!parentProps || !parentProps.children && checkPropsLabel && !parentProps.label) {
    return null;
  }
  var children = parentProps.children;
  var explicitChildren = (0, _ReactUtils.findAllByType)(children, LabelList).map(function (child, index) {
    return /*#__PURE__*/(0, _react.cloneElement)(child, {
      data: data,
      // eslint-disable-next-line react/no-array-index-key
      key: "labelList-".concat(index)
    });
  });
  if (!checkPropsLabel) {
    return explicitChildren;
  }
  var implicitLabelList = parseLabelList(parentProps.label, data);
  return [implicitLabelList].concat(_toConsumableArray(explicitChildren));
}
LabelList.renderCallByParent = renderCallByParent;