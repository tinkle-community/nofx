"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = colors;

function colors(s) {
  return s.match(/.{6}/g).map(function (x) {
    return "#" + x;
  });
}