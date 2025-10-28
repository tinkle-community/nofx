var _excluded = ["width", "height", "className", "style", "children"],
  _excluded2 = ["sourceX", "sourceY", "sourceControlX", "targetX", "targetY", "targetControlX", "linkWidth"];
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @file TreemapChart
 */
import React, { PureComponent } from 'react';
import maxBy from 'lodash/maxBy';
import min from 'lodash/min';
import get from 'lodash/get';
import sumBy from 'lodash/sumBy';
import isFunction from 'lodash/isFunction';
import clsx from 'clsx';
import { Surface } from '../container/Surface';
import { Layer } from '../container/Layer';
import { Tooltip } from '../component/Tooltip';
import { Rectangle } from '../shape/Rectangle';
import { shallowEqual } from '../util/ShallowEqual';
import { filterSvgElements, validateWidthHeight, findChildByType, filterProps } from '../util/ReactUtils';
import { getValueByDataKey } from '../util/ChartUtils';
var defaultCoordinateOfTooltip = {
  x: 0,
  y: 0
};
var interpolationGenerator = function interpolationGenerator(a, b) {
  var ka = +a;
  var kb = b - ka;
  return function (t) {
    return ka + kb * t;
  };
};
var centerY = function centerY(node) {
  return node.y + node.dy / 2;
};
var getValue = function getValue(entry) {
  return entry && entry.value || 0;
};
var getSumOfIds = function getSumOfIds(links, ids) {
  return ids.reduce(function (result, id) {
    return result + getValue(links[id]);
  }, 0);
};
var getSumWithWeightedSource = function getSumWithWeightedSource(tree, links, ids) {
  return ids.reduce(function (result, id) {
    var link = links[id];
    var sourceNode = tree[link.source];
    return result + centerY(sourceNode) * getValue(links[id]);
  }, 0);
};
var getSumWithWeightedTarget = function getSumWithWeightedTarget(tree, links, ids) {
  return ids.reduce(function (result, id) {
    var link = links[id];
    var targetNode = tree[link.target];
    return result + centerY(targetNode) * getValue(links[id]);
  }, 0);
};
var ascendingY = function ascendingY(a, b) {
  return a.y - b.y;
};
var searchTargetsAndSources = function searchTargetsAndSources(links, id) {
  var sourceNodes = [];
  var sourceLinks = [];
  var targetNodes = [];
  var targetLinks = [];
  for (var i = 0, len = links.length; i < len; i++) {
    var link = links[i];
    if (link.source === id) {
      targetNodes.push(link.target);
      targetLinks.push(i);
    }
    if (link.target === id) {
      sourceNodes.push(link.source);
      sourceLinks.push(i);
    }
  }
  return {
    sourceNodes: sourceNodes,
    sourceLinks: sourceLinks,
    targetLinks: targetLinks,
    targetNodes: targetNodes
  };
};
var updateDepthOfTargets = function updateDepthOfTargets(tree, curNode) {
  var targetNodes = curNode.targetNodes;
  for (var i = 0, len = targetNodes.length; i < len; i++) {
    var target = tree[targetNodes[i]];
    if (target) {
      target.depth = Math.max(curNode.depth + 1, target.depth);
      updateDepthOfTargets(tree, target);
    }
  }
};
var getNodesTree = function getNodesTree(_ref, width, nodeWidth) {
  var nodes = _ref.nodes,
    links = _ref.links;
  var tree = nodes.map(function (entry, index) {
    var result = searchTargetsAndSources(links, index);
    return _objectSpread(_objectSpread(_objectSpread({}, entry), result), {}, {
      value: Math.max(getSumOfIds(links, result.sourceLinks), getSumOfIds(links, result.targetLinks)),
      depth: 0
    });
  });
  for (var i = 0, len = tree.length; i < len; i++) {
    var node = tree[i];
    if (!node.sourceNodes.length) {
      updateDepthOfTargets(tree, node);
    }
  }
  var maxDepth = maxBy(tree, function (entry) {
    return entry.depth;
  }).depth;
  if (maxDepth >= 1) {
    var childWidth = (width - nodeWidth) / maxDepth;
    for (var _i = 0, _len = tree.length; _i < _len; _i++) {
      var _node = tree[_i];
      if (!_node.targetNodes.length) {
        _node.depth = maxDepth;
      }
      _node.x = _node.depth * childWidth;
      _node.dx = nodeWidth;
    }
  }
  return {
    tree: tree,
    maxDepth: maxDepth
  };
};
var getDepthTree = function getDepthTree(tree) {
  var result = [];
  for (var i = 0, len = tree.length; i < len; i++) {
    var node = tree[i];
    if (!result[node.depth]) {
      result[node.depth] = [];
    }
    result[node.depth].push(node);
  }
  return result;
};
var updateYOfTree = function updateYOfTree(depthTree, height, nodePadding, links) {
  var yRatio = min(depthTree.map(function (nodes) {
    return (height - (nodes.length - 1) * nodePadding) / sumBy(nodes, getValue);
  }));
  for (var d = 0, maxDepth = depthTree.length; d < maxDepth; d++) {
    for (var i = 0, len = depthTree[d].length; i < len; i++) {
      var node = depthTree[d][i];
      node.y = i;
      node.dy = node.value * yRatio;
    }
  }
  return links.map(function (link) {
    return _objectSpread(_objectSpread({}, link), {}, {
      dy: getValue(link) * yRatio
    });
  });
};
var resolveCollisions = function resolveCollisions(depthTree, height, nodePadding) {
  var sort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  for (var i = 0, len = depthTree.length; i < len; i++) {
    var nodes = depthTree[i];
    var n = nodes.length;

    // Sort by the value of y
    if (sort) {
      nodes.sort(ascendingY);
    }
    var y0 = 0;
    for (var j = 0; j < n; j++) {
      var node = nodes[j];
      var dy = y0 - node.y;
      if (dy > 0) {
        node.y += dy;
      }
      y0 = node.y + node.dy + nodePadding;
    }
    y0 = height + nodePadding;
    for (var _j = n - 1; _j >= 0; _j--) {
      var _node2 = nodes[_j];
      var _dy = _node2.y + _node2.dy + nodePadding - y0;
      if (_dy > 0) {
        _node2.y -= _dy;
        y0 = _node2.y;
      } else {
        break;
      }
    }
  }
};
var relaxLeftToRight = function relaxLeftToRight(tree, depthTree, links, alpha) {
  for (var i = 0, maxDepth = depthTree.length; i < maxDepth; i++) {
    var nodes = depthTree[i];
    for (var j = 0, len = nodes.length; j < len; j++) {
      var node = nodes[j];
      if (node.sourceLinks.length) {
        var sourceSum = getSumOfIds(links, node.sourceLinks);
        var weightedSum = getSumWithWeightedSource(tree, links, node.sourceLinks);
        var y = weightedSum / sourceSum;
        node.y += (y - centerY(node)) * alpha;
      }
    }
  }
};
var relaxRightToLeft = function relaxRightToLeft(tree, depthTree, links, alpha) {
  for (var i = depthTree.length - 1; i >= 0; i--) {
    var nodes = depthTree[i];
    for (var j = 0, len = nodes.length; j < len; j++) {
      var node = nodes[j];
      if (node.targetLinks.length) {
        var targetSum = getSumOfIds(links, node.targetLinks);
        var weightedSum = getSumWithWeightedTarget(tree, links, node.targetLinks);
        var y = weightedSum / targetSum;
        node.y += (y - centerY(node)) * alpha;
      }
    }
  }
};
var updateYOfLinks = function updateYOfLinks(tree, links) {
  for (var i = 0, len = tree.length; i < len; i++) {
    var node = tree[i];
    var sy = 0;
    var ty = 0;
    node.targetLinks.sort(function (a, b) {
      return tree[links[a].target].y - tree[links[b].target].y;
    });
    node.sourceLinks.sort(function (a, b) {
      return tree[links[a].source].y - tree[links[b].source].y;
    });
    for (var j = 0, tLen = node.targetLinks.length; j < tLen; j++) {
      var link = links[node.targetLinks[j]];
      if (link) {
        link.sy = sy;
        sy += link.dy;
      }
    }
    for (var _j2 = 0, sLen = node.sourceLinks.length; _j2 < sLen; _j2++) {
      var _link = links[node.sourceLinks[_j2]];
      if (_link) {
        _link.ty = ty;
        ty += _link.dy;
      }
    }
  }
};
var computeData = function computeData(_ref2) {
  var data = _ref2.data,
    width = _ref2.width,
    height = _ref2.height,
    iterations = _ref2.iterations,
    nodeWidth = _ref2.nodeWidth,
    nodePadding = _ref2.nodePadding,
    sort = _ref2.sort;
  var links = data.links;
  var _getNodesTree = getNodesTree(data, width, nodeWidth),
    tree = _getNodesTree.tree;
  var depthTree = getDepthTree(tree);
  var newLinks = updateYOfTree(depthTree, height, nodePadding, links);
  resolveCollisions(depthTree, height, nodePadding, sort);
  var alpha = 1;
  for (var i = 1; i <= iterations; i++) {
    relaxRightToLeft(tree, depthTree, newLinks, alpha *= 0.99);
    resolveCollisions(depthTree, height, nodePadding, sort);
    relaxLeftToRight(tree, depthTree, newLinks, alpha);
    resolveCollisions(depthTree, height, nodePadding, sort);
  }
  updateYOfLinks(tree, newLinks);
  return {
    nodes: tree,
    links: newLinks
  };
};
var getCoordinateOfTooltip = function getCoordinateOfTooltip(el, type) {
  if (type === 'node') {
    return {
      x: el.x + el.width / 2,
      y: el.y + el.height / 2
    };
  }
  return {
    x: (el.sourceX + el.targetX) / 2,
    y: (el.sourceY + el.targetY) / 2
  };
};
var getPayloadOfTooltip = function getPayloadOfTooltip(el, type, nameKey) {
  var payload = el.payload;
  if (type === 'node') {
    return [{
      payload: el,
      name: getValueByDataKey(payload, nameKey, ''),
      value: getValueByDataKey(payload, 'value')
    }];
  }
  if (payload.source && payload.target) {
    var sourceName = getValueByDataKey(payload.source, nameKey, '');
    var targetName = getValueByDataKey(payload.target, nameKey, '');
    return [{
      payload: el,
      name: "".concat(sourceName, " - ").concat(targetName),
      value: getValueByDataKey(payload, 'value')
    }];
  }
  return [];
};
export var Sankey = /*#__PURE__*/function (_PureComponent) {
  function Sankey() {
    var _this;
    _classCallCheck(this, Sankey);
    for (var _len2 = arguments.length, args = new Array(_len2), _key = 0; _key < _len2; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Sankey, [].concat(args));
    _defineProperty(_this, "state", {
      activeElement: null,
      activeElementType: null,
      isTooltipActive: false,
      nodes: [],
      links: []
    });
    return _this;
  }
  _inherits(Sankey, _PureComponent);
  return _createClass(Sankey, [{
    key: "handleMouseEnter",
    value: function handleMouseEnter(el, type, e) {
      var _this$props = this.props,
        onMouseEnter = _this$props.onMouseEnter,
        children = _this$props.children;
      var tooltipItem = findChildByType(children, Tooltip);
      if (tooltipItem) {
        this.setState(function (prev) {
          if (tooltipItem.props.trigger === 'hover') {
            return _objectSpread(_objectSpread({}, prev), {}, {
              activeElement: el,
              activeElementType: type,
              isTooltipActive: true
            });
          }
          return prev;
        }, function () {
          if (onMouseEnter) {
            onMouseEnter(el, type, e);
          }
        });
      } else if (onMouseEnter) {
        onMouseEnter(el, type, e);
      }
    }
  }, {
    key: "handleMouseLeave",
    value: function handleMouseLeave(el, type, e) {
      var _this$props2 = this.props,
        onMouseLeave = _this$props2.onMouseLeave,
        children = _this$props2.children;
      var tooltipItem = findChildByType(children, Tooltip);
      if (tooltipItem) {
        this.setState(function (prev) {
          if (tooltipItem.props.trigger === 'hover') {
            return _objectSpread(_objectSpread({}, prev), {}, {
              activeElement: undefined,
              activeElementType: undefined,
              isTooltipActive: false
            });
          }
          return prev;
        }, function () {
          if (onMouseLeave) {
            onMouseLeave(el, type, e);
          }
        });
      } else if (onMouseLeave) {
        onMouseLeave(el, type, e);
      }
    }
  }, {
    key: "handleClick",
    value: function handleClick(el, type, e) {
      var _this$props3 = this.props,
        onClick = _this$props3.onClick,
        children = _this$props3.children;
      var tooltipItem = findChildByType(children, Tooltip);
      if (tooltipItem && tooltipItem.props.trigger === 'click') {
        if (this.state.isTooltipActive) {
          this.setState(function (prev) {
            return _objectSpread(_objectSpread({}, prev), {}, {
              activeElement: undefined,
              activeElementType: undefined,
              isTooltipActive: false
            });
          });
        } else {
          this.setState(function (prev) {
            return _objectSpread(_objectSpread({}, prev), {}, {
              activeElement: el,
              activeElementType: type,
              isTooltipActive: true
            });
          });
        }
      }
      if (onClick) onClick(el, type, e);
    }
  }, {
    key: "renderLinks",
    value: function renderLinks(links, nodes) {
      var _this2 = this;
      var _this$props4 = this.props,
        linkCurvature = _this$props4.linkCurvature,
        linkContent = _this$props4.link,
        margin = _this$props4.margin;
      var top = get(margin, 'top') || 0;
      var left = get(margin, 'left') || 0;
      return /*#__PURE__*/React.createElement(Layer, {
        className: "recharts-sankey-links",
        key: "recharts-sankey-links"
      }, links.map(function (link, i) {
        var sourceRelativeY = link.sy,
          targetRelativeY = link.ty,
          linkWidth = link.dy;
        var source = nodes[link.source];
        var target = nodes[link.target];
        var sourceX = source.x + source.dx + left;
        var targetX = target.x + left;
        var interpolationFunc = interpolationGenerator(sourceX, targetX);
        var sourceControlX = interpolationFunc(linkCurvature);
        var targetControlX = interpolationFunc(1 - linkCurvature);
        var sourceY = source.y + sourceRelativeY + linkWidth / 2 + top;
        var targetY = target.y + targetRelativeY + linkWidth / 2 + top;
        var linkProps = _objectSpread({
          sourceX: sourceX,
          targetX: targetX,
          sourceY: sourceY,
          targetY: targetY,
          sourceControlX: sourceControlX,
          targetControlX: targetControlX,
          sourceRelativeY: sourceRelativeY,
          targetRelativeY: targetRelativeY,
          linkWidth: linkWidth,
          index: i,
          payload: _objectSpread(_objectSpread({}, link), {}, {
            source: source,
            target: target
          })
        }, filterProps(linkContent, false));
        var events = {
          onMouseEnter: _this2.handleMouseEnter.bind(_this2, linkProps, 'link'),
          onMouseLeave: _this2.handleMouseLeave.bind(_this2, linkProps, 'link'),
          onClick: _this2.handleClick.bind(_this2, linkProps, 'link')
        };
        return /*#__PURE__*/React.createElement(Layer, _extends({
          key: "link-".concat(link.source, "-").concat(link.target, "-").concat(link.value)
        }, events), _this2.constructor.renderLinkItem(linkContent, linkProps));
      }));
    }
  }, {
    key: "renderNodes",
    value: function renderNodes(nodes) {
      var _this3 = this;
      var _this$props5 = this.props,
        nodeContent = _this$props5.node,
        margin = _this$props5.margin;
      var top = get(margin, 'top') || 0;
      var left = get(margin, 'left') || 0;
      return /*#__PURE__*/React.createElement(Layer, {
        className: "recharts-sankey-nodes",
        key: "recharts-sankey-nodes"
      }, nodes.map(function (node, i) {
        var x = node.x,
          y = node.y,
          dx = node.dx,
          dy = node.dy;
        var nodeProps = _objectSpread(_objectSpread({}, filterProps(nodeContent, false)), {}, {
          x: x + left,
          y: y + top,
          width: dx,
          height: dy,
          index: i,
          payload: node
        });
        var events = {
          onMouseEnter: _this3.handleMouseEnter.bind(_this3, nodeProps, 'node'),
          onMouseLeave: _this3.handleMouseLeave.bind(_this3, nodeProps, 'node'),
          onClick: _this3.handleClick.bind(_this3, nodeProps, 'node')
        };
        return /*#__PURE__*/React.createElement(Layer, _extends({
          key: "node-".concat(node.x, "-").concat(node.y, "-").concat(node.value)
        }, events), _this3.constructor.renderNodeItem(nodeContent, nodeProps));
      }));
    }
  }, {
    key: "renderTooltip",
    value: function renderTooltip() {
      var _this$props6 = this.props,
        children = _this$props6.children,
        width = _this$props6.width,
        height = _this$props6.height,
        nameKey = _this$props6.nameKey;
      var tooltipItem = findChildByType(children, Tooltip);
      if (!tooltipItem) {
        return null;
      }
      var _this$state = this.state,
        isTooltipActive = _this$state.isTooltipActive,
        activeElement = _this$state.activeElement,
        activeElementType = _this$state.activeElementType;
      var viewBox = {
        x: 0,
        y: 0,
        width: width,
        height: height
      };
      var coordinate = activeElement ? getCoordinateOfTooltip(activeElement, activeElementType) : defaultCoordinateOfTooltip;
      var payload = activeElement ? getPayloadOfTooltip(activeElement, activeElementType, nameKey) : [];
      return /*#__PURE__*/React.cloneElement(tooltipItem, {
        viewBox: viewBox,
        active: isTooltipActive,
        coordinate: coordinate,
        label: '',
        payload: payload
      });
    }
  }, {
    key: "render",
    value: function render() {
      if (!validateWidthHeight(this)) {
        return null;
      }
      var _this$props7 = this.props,
        width = _this$props7.width,
        height = _this$props7.height,
        className = _this$props7.className,
        style = _this$props7.style,
        children = _this$props7.children,
        others = _objectWithoutProperties(_this$props7, _excluded);
      var _this$state2 = this.state,
        links = _this$state2.links,
        nodes = _this$state2.nodes;
      var attrs = filterProps(others, false);
      return /*#__PURE__*/React.createElement("div", {
        className: clsx('recharts-wrapper', className),
        style: _objectSpread(_objectSpread({}, style), {}, {
          position: 'relative',
          cursor: 'default',
          width: width,
          height: height
        }),
        role: "region"
      }, /*#__PURE__*/React.createElement(Surface, _extends({}, attrs, {
        width: width,
        height: height
      }), filterSvgElements(children), this.renderLinks(links, nodes), this.renderNodes(nodes)), this.renderTooltip());
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      var data = nextProps.data,
        width = nextProps.width,
        height = nextProps.height,
        margin = nextProps.margin,
        iterations = nextProps.iterations,
        nodeWidth = nextProps.nodeWidth,
        nodePadding = nextProps.nodePadding,
        sort = nextProps.sort;
      if (data !== prevState.prevData || width !== prevState.prevWidth || height !== prevState.prevHeight || !shallowEqual(margin, prevState.prevMargin) || iterations !== prevState.prevIterations || nodeWidth !== prevState.prevNodeWidth || nodePadding !== prevState.prevNodePadding || sort !== prevState.sort) {
        var contentWidth = width - (margin && margin.left || 0) - (margin && margin.right || 0);
        var contentHeight = height - (margin && margin.top || 0) - (margin && margin.bottom || 0);
        var _computeData = computeData({
            data: data,
            width: contentWidth,
            height: contentHeight,
            iterations: iterations,
            nodeWidth: nodeWidth,
            nodePadding: nodePadding,
            sort: sort
          }),
          links = _computeData.links,
          nodes = _computeData.nodes;
        return _objectSpread(_objectSpread({}, prevState), {}, {
          nodes: nodes,
          links: links,
          prevData: data,
          prevWidth: iterations,
          prevHeight: height,
          prevMargin: margin,
          prevNodePadding: nodePadding,
          prevNodeWidth: nodeWidth,
          prevIterations: iterations,
          prevSort: sort
        });
      }
      return null;
    }
  }, {
    key: "renderLinkItem",
    value: function renderLinkItem(option, props) {
      if ( /*#__PURE__*/React.isValidElement(option)) {
        return /*#__PURE__*/React.cloneElement(option, props);
      }
      if (isFunction(option)) {
        return option(props);
      }
      var sourceX = props.sourceX,
        sourceY = props.sourceY,
        sourceControlX = props.sourceControlX,
        targetX = props.targetX,
        targetY = props.targetY,
        targetControlX = props.targetControlX,
        linkWidth = props.linkWidth,
        others = _objectWithoutProperties(props, _excluded2);
      return /*#__PURE__*/React.createElement("path", _extends({
        className: "recharts-sankey-link",
        d: "\n          M".concat(sourceX, ",").concat(sourceY, "\n          C").concat(sourceControlX, ",").concat(sourceY, " ").concat(targetControlX, ",").concat(targetY, " ").concat(targetX, ",").concat(targetY, "\n        "),
        fill: "none",
        stroke: "#333",
        strokeWidth: linkWidth,
        strokeOpacity: "0.2"
      }, filterProps(others, false)));
    }
  }, {
    key: "renderNodeItem",
    value: function renderNodeItem(option, props) {
      if ( /*#__PURE__*/React.isValidElement(option)) {
        return /*#__PURE__*/React.cloneElement(option, props);
      }
      if (isFunction(option)) {
        return option(props);
      }
      return /*#__PURE__*/React.createElement(Rectangle, _extends({
        className: "recharts-sankey-node",
        fill: "#0088fe",
        fillOpacity: "0.8"
      }, filterProps(props, false), {
        role: "img"
      }));
    }
  }]);
}(PureComponent);
_defineProperty(Sankey, "displayName", 'Sankey');
_defineProperty(Sankey, "defaultProps", {
  nameKey: 'name',
  dataKey: 'value',
  nodePadding: 10,
  nodeWidth: 10,
  linkCurvature: 0.5,
  iterations: 32,
  margin: {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  },
  sort: true
});