"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = difference;

var _index = require("../../../lib-vendor/internmap/src/index.js");

function difference(values, ...others) {
  values = new _index.InternSet(values);

  for (const other of others) {
    for (const value of other) {
      values.delete(value);
    }
  }

  return values;
}