"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _math = require("../math.js");

var _default = {
  draw(context, size) {
    const r = (0, _math.sqrt)(size) * 0.4431;
    context.moveTo(r, r);
    context.lineTo(r, -r);
    context.lineTo(-r, -r);
    context.lineTo(-r, r);
    context.closePath();
  }

};
exports.default = _default;