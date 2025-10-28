"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = permute;

function permute(source, keys) {
  return Array.from(keys, key => source[key]);
}