"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateViewBox = void 0;
var _memoize = _interopRequireDefault(require("lodash/memoize"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
/**
 * This is memoized because the viewBox is unlikely to change often
 * - but because it is computed from offset, any change to it would re-render all children.
 *
 * And because we have many readers of the viewBox, and update it only rarely,
 * then let's optimize with memoization.
 */
var calculateViewBox = exports.calculateViewBox = (0, _memoize["default"])(function (offset) {
  return {
    x: offset.left,
    y: offset.top,
    width: offset.width,
    height: offset.height
  };
}, function (offset) {
  return ['l', offset.left, 't', offset.top, 'w', offset.width, 'h', offset.height].join('');
});