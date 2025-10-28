"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactTransitionGroup = require("react-transition-group");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _AnimateGroupChild = _interopRequireDefault(require("./AnimateGroupChild"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function AnimateGroup(props) {
  var component = props.component,
    children = props.children,
    appear = props.appear,
    enter = props.enter,
    leave = props.leave;
  return /*#__PURE__*/_react.default.createElement(_reactTransitionGroup.TransitionGroup, {
    component: component
  }, _react.Children.map(children, function (child, index) {
    return /*#__PURE__*/_react.default.createElement(_AnimateGroupChild.default, {
      appearOptions: appear,
      enterOptions: enter,
      leaveOptions: leave,
      key: "child-".concat(index) // eslint-disable-line
    }, child);
  }));
}
AnimateGroup.propTypes = {
  appear: _propTypes.default.object,
  enter: _propTypes.default.object,
  leave: _propTypes.default.object,
  children: _propTypes.default.oneOfType([_propTypes.default.array, _propTypes.default.element]),
  component: _propTypes.default.any
};
AnimateGroup.defaultProps = {
  component: 'span'
};
var _default = exports.default = AnimateGroup;