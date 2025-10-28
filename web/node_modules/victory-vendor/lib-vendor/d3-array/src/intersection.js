"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = intersection;

var _index = require("../../../lib-vendor/internmap/src/index.js");

function intersection(values, ...others) {
  values = new _index.InternSet(values);
  others = others.map(set);

  out: for (const value of values) {
    for (const other of others) {
      if (!other.has(value)) {
        values.delete(value);
        continue out;
      }
    }
  }

  return values;
}

function set(values) {
  return values instanceof _index.InternSet ? values : new _index.InternSet(values);
}