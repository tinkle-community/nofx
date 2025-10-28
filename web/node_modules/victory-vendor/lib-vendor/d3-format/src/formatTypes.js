"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _formatDecimal = _interopRequireDefault(require("./formatDecimal.js"));

var _formatPrefixAuto = _interopRequireDefault(require("./formatPrefixAuto.js"));

var _formatRounded = _interopRequireDefault(require("./formatRounded.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  "%": (x, p) => (x * 100).toFixed(p),
  "b": x => Math.round(x).toString(2),
  "c": x => x + "",
  "d": _formatDecimal.default,
  "e": (x, p) => x.toExponential(p),
  "f": (x, p) => x.toFixed(p),
  "g": (x, p) => x.toPrecision(p),
  "o": x => Math.round(x).toString(8),
  "p": (x, p) => (0, _formatRounded.default)(x * 100, p),
  "r": _formatRounded.default,
  "s": _formatPrefixAuto.default,
  "X": x => Math.round(x).toString(16).toUpperCase(),
  "x": x => Math.round(x).toString(16)
};
exports.default = _default;