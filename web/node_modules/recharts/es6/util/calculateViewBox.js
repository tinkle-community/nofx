import memoize from 'lodash/memoize';
/**
 * This is memoized because the viewBox is unlikely to change often
 * - but because it is computed from offset, any change to it would re-render all children.
 *
 * And because we have many readers of the viewBox, and update it only rarely,
 * then let's optimize with memoization.
 */
export var calculateViewBox = memoize(function (offset) {
  return {
    x: offset.left,
    y: offset.top,
    width: offset.width,
    height: offset.height
  };
}, function (offset) {
  return ['l', offset.left, 't', offset.top, 'w', offset.width, 'h', offset.height].join('');
});