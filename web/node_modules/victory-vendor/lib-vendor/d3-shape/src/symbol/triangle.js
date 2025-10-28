"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _math = require("../math.js");

const sqrt3 = (0, _math.sqrt)(3);
var _default = {
  draw(context, size) {
    const y = -(0, _math.sqrt)(size / (sqrt3 * 3));
    context.moveTo(0, y * 2);
    context.lineTo(-sqrt3 * y, -y);
    context.lineTo(sqrt3 * y, -y);
    context.closePath();
  }

};
exports.default = _default;