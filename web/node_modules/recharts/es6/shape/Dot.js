function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
/**
 * @fileOverview Dot
 */
import * as React from 'react';
import clsx from 'clsx';
import { adaptEventHandlers } from '../util/types';
import { filterProps } from '../util/ReactUtils';
export var Dot = function Dot(props) {
  var cx = props.cx,
    cy = props.cy,
    r = props.r,
    className = props.className;
  var layerClass = clsx('recharts-dot', className);
  if (cx === +cx && cy === +cy && r === +r) {
    return /*#__PURE__*/React.createElement("circle", _extends({}, filterProps(props, false), adaptEventHandlers(props), {
      className: layerClass,
      cx: cx,
      cy: cy,
      r: r
    }));
  }
  return null;
};