"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = union;

var _index = require("../../../lib-vendor/internmap/src/index.js");

function union(...others) {
  const set = new _index.InternSet();

  for (const other of others) {
    for (const o of other) {
      set.add(o);
    }
  }

  return set;
}