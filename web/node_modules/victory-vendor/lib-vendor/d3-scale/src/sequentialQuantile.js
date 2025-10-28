"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sequentialQuantile;

var _index = require("../../../lib-vendor/d3-array/src/index.js");

var _continuous = require("./continuous.js");

var _init = require("./init.js");

function sequentialQuantile() {
  var domain = [],
      interpolator = _continuous.identity;

  function scale(x) {
    if (x != null && !isNaN(x = +x)) return interpolator(((0, _index.bisect)(domain, x, 1) - 1) / (domain.length - 1));
  }

  scale.domain = function (_) {
    if (!arguments.length) return domain.slice();
    domain = [];

    for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);

    domain.sort(_index.ascending);
    return scale;
  };

  scale.interpolator = function (_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  scale.range = function () {
    return domain.map((d, i) => interpolator(i / (domain.length - 1)));
  };

  scale.quantiles = function (n) {
    return Array.from({
      length: n + 1
    }, (_, i) => (0, _index.quantile)(domain, i / n));
  };

  scale.copy = function () {
    return sequentialQuantile(interpolator).domain(domain);
  };

  return _init.initInterpolator.apply(scale, arguments);
}