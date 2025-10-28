"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = disjoint;

var _index = require("../../../lib-vendor/internmap/src/index.js");

function disjoint(values, other) {
  const iterator = other[Symbol.iterator](),
        set = new _index.InternSet();

  for (const v of values) {
    if (set.has(v)) return false;
    let value, done;

    while (({
      value,
      done
    } = iterator.next())) {
      if (done) break;
      if (Object.is(v, value)) return false;
      set.add(value);
    }
  }

  return true;
}