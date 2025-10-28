"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = threshold;

var _index = require("../../../lib-vendor/d3-array/src/index.js");

var _init = require("./init.js");

function threshold() {
  var domain = [0.5],
      range = [0, 1],
      unknown,
      n = 1;

  function scale(x) {
    return x != null && x <= x ? range[(0, _index.bisect)(domain, x, 0, n)] : unknown;
  }

  scale.domain = function (_) {
    return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : domain.slice();
  };

  scale.range = function (_) {
    return arguments.length ? (range = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : range.slice();
  };

  scale.invertExtent = function (y) {
    var i = range.indexOf(y);
    return [domain[i - 1], domain[i]];
  };

  scale.unknown = function (_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function () {
    return threshold().domain(domain).range(range).unknown(unknown);
  };

  return _init.initRange.apply(scale, arguments);
}