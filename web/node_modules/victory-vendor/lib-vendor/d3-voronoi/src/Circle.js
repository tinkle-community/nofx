"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attachCircle = attachCircle;
exports.detachCircle = detachCircle;
exports.firstCircle = void 0;

var _RedBlackTree = require("./RedBlackTree");

var _Diagram = require("./Diagram");

var circlePool = [];
var firstCircle;
exports.firstCircle = firstCircle;

function Circle() {
  (0, _RedBlackTree.RedBlackNode)(this);
  this.x = this.y = this.arc = this.site = this.cy = null;
}

function attachCircle(arc) {
  var lArc = arc.P,
      rArc = arc.N;
  if (!lArc || !rArc) return;
  var lSite = lArc.site,
      cSite = arc.site,
      rSite = rArc.site;
  if (lSite === rSite) return;
  var bx = cSite[0],
      by = cSite[1],
      ax = lSite[0] - bx,
      ay = lSite[1] - by,
      cx = rSite[0] - bx,
      cy = rSite[1] - by;
  var d = 2 * (ax * cy - ay * cx);
  if (d >= -_Diagram.epsilon2) return;
  var ha = ax * ax + ay * ay,
      hc = cx * cx + cy * cy,
      x = (cy * ha - ay * hc) / d,
      y = (ax * hc - cx * ha) / d;
  var circle = circlePool.pop() || new Circle();
  circle.arc = arc;
  circle.site = cSite;
  circle.x = x + bx;
  circle.y = (circle.cy = y + by) + Math.sqrt(x * x + y * y); // y bottom

  arc.circle = circle;
  var before = null,
      node = _Diagram.circles._;

  while (node) {
    if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
      if (node.L) node = node.L;else {
        before = node.P;
        break;
      }
    } else {
      if (node.R) node = node.R;else {
        before = node;
        break;
      }
    }
  }

  _Diagram.circles.insert(before, circle);

  if (!before) exports.firstCircle = firstCircle = circle;
}

function detachCircle(arc) {
  var circle = arc.circle;

  if (circle) {
    if (!circle.P) exports.firstCircle = firstCircle = circle.N;

    _Diagram.circles.remove(circle);

    circlePool.push(circle);
    (0, _RedBlackTree.RedBlackNode)(circle);
    arc.circle = null;
  }
}