import React, { Children } from 'react';
import { TransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import AnimateGroupChild from './AnimateGroupChild';
function AnimateGroup(props) {
  var component = props.component,
    children = props.children,
    appear = props.appear,
    enter = props.enter,
    leave = props.leave;
  return /*#__PURE__*/React.createElement(TransitionGroup, {
    component: component
  }, Children.map(children, function (child, index) {
    return /*#__PURE__*/React.createElement(AnimateGroupChild, {
      appearOptions: appear,
      enterOptions: enter,
      leaveOptions: leave,
      key: "child-".concat(index) // eslint-disable-line
    }, child);
  }));
}
AnimateGroup.propTypes = {
  appear: PropTypes.object,
  enter: PropTypes.object,
  leave: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
  component: PropTypes.any
};
AnimateGroup.defaultProps = {
  component: 'span'
};
export default AnimateGroup;