/* eslint no-console: 0 */

export const getIntersectionKeys = (preObj, nextObj) =>
  [Object.keys(preObj), Object.keys(nextObj)].reduce((a, b) => a.filter(c => b.includes(c)));

export const identity = param => param;

/*
 * @description: convert camel case to dash case
 * string => string
 */
export const getDashCase = name => name.replace(/([A-Z])/g, v => `-${v.toLowerCase()}`);

export const log = (...args) => {
  console.log(...args);
};

/*
 * @description: log the value of a varible
 * string => any => any
 */
export const debug = name => item => {
  log(name, item);

  return item;
};

/*
 * @description: log name, args, return value of a function
 * function => function
 */
export const debugf =
  (tag, f) =>
  (...args) => {
    const res = f(...args);
    const name = tag || f.name || 'anonymous function';
    const argNames = `(${args.map(JSON.stringify).join(', ')})`;

    log(`${name}: ${argNames} => ${JSON.stringify(res)}`);

    return res;
  };

/*
 * @description: map object on every element in this object.
 * (function, object) => object
 */
export const mapObject = (fn, obj) =>
  Object.keys(obj).reduce(
    (res, key) => ({
      ...res,
      [key]: fn(key, obj[key]),
    }),
    {},
  );

export const getTransitionVal = (props, duration, easing) =>
  props.map(prop => `${getDashCase(prop)} ${duration}ms ${easing}`).join(',');

const isDev = process.env.NODE_ENV !== 'production';

export const warn = (condition, format, a, b, c, d, e, f) => {
  if (isDev && typeof console !== 'undefined' && console.warn) {
    if (format === undefined) {
      console.warn('LogUtils requires an error message argument');
    }

    if (!condition) {
      if (format === undefined) {
        console.warn(
          'Minified exception occurred; use the non-minified dev environment ' +
            'for the full error message and additional helpful warnings.',
        );
      } else {
        const args = [a, b, c, d, e, f];
        let argIndex = 0;

        console.warn(format.replace(/%s/g, () => args[argIndex++]));
      }
    }
  }
};
