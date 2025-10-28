"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _math = require("../math.js");

var _default = {
  draw(context, size) {
    const w = (0, _math.sqrt)(size);
    const x = -w / 2;
    context.rect(x, x, w, w);
  }

};
exports.default = _default;