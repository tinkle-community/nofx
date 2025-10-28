import { getIntersectionKeys, mapObject } from './util';

const alpha = (begin, end, k) => begin + (end - begin) * k;
const needContinue = ({ from, to }) => from !== to;

/*
 * @description: cal new from value and velocity in each stepper
 * @return: { [styleProperty]: { from, to, velocity } }
 */
const calStepperVals = (easing, preVals, steps) => {
  const nextStepVals = mapObject((key, val) => {
    if (needContinue(val)) {
      const [newX, newV] = easing(val.from, val.to, val.velocity);
      return {
        ...val,
        from: newX,
        velocity: newV,
      };
    }

    return val;
  }, preVals);

  if (steps < 1) {
    return mapObject((key, val) => {
      if (needContinue(val)) {
        return {
          ...val,
          velocity: alpha(val.velocity, nextStepVals[key].velocity, steps),
          from: alpha(val.from, nextStepVals[key].from, steps),
        };
      }

      return val;
    }, preVals);
  }

  return calStepperVals(easing, nextStepVals, steps - 1);
};

// configure update function
export default (from, to, easing, duration, render) => {
  const interKeys = getIntersectionKeys(from, to);
  const timingStyle = interKeys.reduce(
    (res, key) => ({
      ...res,
      [key]: [from[key], to[key]],
    }),
    {},
  );

  let stepperStyle = interKeys.reduce(
    (res, key) => ({
      ...res,
      [key]: {
        from: from[key],
        velocity: 0,
        to: to[key],
      },
    }),
    {},
  );
  let cafId = -1;
  let preTime;
  let beginTime;
  let update = () => null;

  const getCurrStyle = () => mapObject((key, val) => val.from, stepperStyle);
  const shouldStopAnimation = () => !Object.values(stepperStyle).filter(needContinue).length;

  // stepper timing function like spring
  const stepperUpdate = now => {
    if (!preTime) {
      preTime = now;
    }
    const deltaTime = now - preTime;
    const steps = deltaTime / easing.dt;

    stepperStyle = calStepperVals(easing, stepperStyle, steps);
    // get union set and add compatible prefix
    render({
      ...from,
      ...to,
      ...getCurrStyle(stepperStyle),
    });

    preTime = now;

    if (!shouldStopAnimation()) {
      cafId = requestAnimationFrame(update);
    }
  };

  // t => val timing function like cubic-bezier
  const timingUpdate = now => {
    if (!beginTime) {
      beginTime = now;
    }

    const t = (now - beginTime) / duration;
    const currStyle = mapObject((key, val) => alpha(...val, easing(t)), timingStyle);

    // get union set and add compatible prefix
    render({
      ...from,
      ...to,
      ...currStyle,
    });

    if (t < 1) {
      cafId = requestAnimationFrame(update);
    } else {
      const finalStyle = mapObject((key, val) => alpha(...val, easing(1)), timingStyle);

      render({
        ...from,
        ...to,
        ...finalStyle,
      });
    }
  };

  update = easing.isStepper ? stepperUpdate : timingUpdate;

  // return start animation method
  return () => {
    requestAnimationFrame(update);

    // return stop animation method
    return () => {
      cancelAnimationFrame(cafId);
    };
  };
};
