"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = identity;

var _linear = require("./linear.js");

var _number = _interopRequireDefault(require("./number.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function identity(domain) {
  var unknown;

  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : x;
  }

  scale.invert = scale;

  scale.domain = scale.range = function (_) {
    return arguments.length ? (domain = Array.from(_, _number.default), scale) : domain.slice();
  };

  scale.unknown = function (_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function () {
    return identity(domain).unknown(unknown);
  };

  domain = arguments.length ? Array.from(domain, _number.default) : [0, 1];
  return (0, _linear.linearish)(scale);
}