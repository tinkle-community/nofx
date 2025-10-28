import React, { Children } from 'react';
import { TransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import AnimateGroupChild from './AnimateGroupChild';

function AnimateGroup(props) {
  const { component, children, appear, enter, leave } = props;

  return (
    <TransitionGroup component={component}>
      {Children.map(children, (child, index) => (
        <AnimateGroupChild
          appearOptions={appear}
          enterOptions={enter}
          leaveOptions={leave}
            key={`child-${index}`} // eslint-disable-line
        >
          {child}
        </AnimateGroupChild>
      ))}
    </TransitionGroup>
  );
}

AnimateGroup.propTypes = {
  appear: PropTypes.object,
  enter: PropTypes.object,
  leave: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
  component: PropTypes.any,
};

AnimateGroup.defaultProps = {
  component: 'span',
};

export default AnimateGroup;
