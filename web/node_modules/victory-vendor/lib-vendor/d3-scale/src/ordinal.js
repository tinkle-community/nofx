"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ordinal;
exports.implicit = void 0;

var _index = require("../../../lib-vendor/d3-array/src/index.js");

var _init = require("./init.js");

const implicit = Symbol("implicit");
exports.implicit = implicit;

function ordinal() {
  var index = new _index.InternMap(),
      domain = [],
      range = [],
      unknown = implicit;

  function scale(d) {
    let i = index.get(d);

    if (i === undefined) {
      if (unknown !== implicit) return unknown;
      index.set(d, i = domain.push(d) - 1);
    }

    return range[i % range.length];
  }

  scale.domain = function (_) {
    if (!arguments.length) return domain.slice();
    domain = [], index = new _index.InternMap();

    for (const value of _) {
      if (index.has(value)) continue;
      index.set(value, domain.push(value) - 1);
    }

    return scale;
  };

  scale.range = function (_) {
    return arguments.length ? (range = Array.from(_), scale) : range.slice();
  };

  scale.unknown = function (_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function () {
    return ordinal(domain, range).unknown(unknown);
  };

  _init.initRange.apply(scale, arguments);

  return scale;
}