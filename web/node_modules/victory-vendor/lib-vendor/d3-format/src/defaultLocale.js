"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defaultLocale;
exports.formatPrefix = exports.format = void 0;

var _locale = _interopRequireDefault(require("./locale.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var locale;
var format;
exports.format = format;
var formatPrefix;
exports.formatPrefix = formatPrefix;
defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});

function defaultLocale(definition) {
  locale = (0, _locale.default)(definition);
  exports.format = format = locale.format;
  exports.formatPrefix = formatPrefix = locale.formatPrefix;
  return locale;
}