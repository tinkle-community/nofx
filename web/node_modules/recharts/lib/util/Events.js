"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eventCenter = exports.SYNC_EVENT = void 0;
var _eventemitter = _interopRequireDefault(require("eventemitter3"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var eventCenter = exports.eventCenter = new _eventemitter["default"]();
var SYNC_EVENT = exports.SYNC_EVENT = 'recharts.syncMouseEvents';