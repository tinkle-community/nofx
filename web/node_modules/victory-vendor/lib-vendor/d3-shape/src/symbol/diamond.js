"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _math = require("../math.js");

const tan30 = (0, _math.sqrt)(1 / 3);
const tan30_2 = tan30 * 2;
var _default = {
  draw(context, size) {
    const y = (0, _math.sqrt)(size / tan30_2);
    const x = y * tan30;
    context.moveTo(0, -y);
    context.lineTo(x, 0);
    context.lineTo(0, y);
    context.lineTo(-x, 0);
    context.closePath();
  }

};
exports.default = _default;