# react-smooth

react-smooth is a animation library work on React.

[![npm version](https://badge.fury.io/js/react-smooth.png)](https://badge.fury.io/js/react-smooth)
[![build status](https://travis-ci.org/recharts/react-smooth.svg)](https://travis-ci.org/recharts/react-smooth)
[![npm downloads](https://img.shields.io/npm/dt/react-smooth.svg?style=flat-square)](https://www.npmjs.com/package/react-smooth)
[![Gitter](https://badges.gitter.im/recharts/react-smooth.svg)](https://gitter.im/recharts/react-smooth?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## install
```
npm install --save react-smooth
```

## Usage
simple animation

```jsx
<Animate to="0" from="1" attributeName="opacity">
  <div />
</Animate>
```
steps animation

```jsx
const steps = [{
  style: {
    opacity: 0,
  },
  duration: 400,
}, {
  style: {
    opacity: 1,
    transform: 'translate(0, 0)',
  },
  duration: 1000,
}, {
  style: {
    transform: 'translate(100px, 100px)',
  },
  duration: 1200,
}];

<Animate steps={steps}>
  <div />
</Animate>
```
children can be a function

```jsx
<Animate from={{ opacity: 0 }}
  to={{ opacity: 1 }}
  easing="ease-in"
  >
  {
    ({ opacity }) => <div style={{ opacity }}></div>
  }
</Animate>
```

you can configure js timing function

```js
const easing = configureBezier(0.1, 0.1, 0.5, 0.8);
const easing = configureSpring({ stiff: 170, damping: 20 });
```

group animation

```jsx
const appear = {
  from: 0,
  to: 1,
  attributeName: 'opacity',
};

const leave = {
  steps: [{
    style: {
      transform: 'translateX(0)',
    },
  }, {
    duration: 1000,
    style: {
      transform: 'translateX(300)',
      height: 50,
    },
  }, {
    duration: 2000,
    style: {
      height: 0,
    },
  }]
}

<AnimateGroup appear={appear} leave={leave}>
  { list }
</AnimateGroup>

/*
 *  @description: add compatible prefix in style
 *
 *  style = { transform: xxx, ...others };
 *
 *  translatedStyle = {
 *    WebkitTransform: xxx,
 *    MozTransform: xxx,
 *    OTransform: xxx,
 *    msTransform: xxx,
 *    ...others,
 *  };
 */

const translatedStyle = translateStyle(style);


```

## API

### Animate

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 50px">name</th>
        <th style="width: 100px">type</th>
        <th style="width: 50px">default</th>
        <th style="width: 50px">description</th>
    </tr>
    </thead>
    <tbody>
        <tr>
          <td>from</td>
          <td>string or object</td>
          <td>''</td>
          <td>set the initial style of the children</td>
        </tr>
        <tr>
          <td>to</td>
          <td>string or object</td>
          <td>''</td>
          <td>set the final style of the children</td>
        </tr>
        <tr>
          <td>canBegin</td>
          <td>boolean</td>
          <td>true</td>
          <td>whether the animation is start</td>
        </tr>
        <tr>
          <td>begin</td>
          <td>number</td>
          <td>0</td>
          <td>animation delay time</td>
        </tr>
        <tr>
          <td>duration</td>
          <td>number</td>
          <td>1000</td>
          <td>animation duration</td>
        </tr>
        <tr>
          <td>steps</td>
          <td>array</td>
          <td>[]</td>
          <td>animation keyframes</td>
        </tr>
        <tr>
          <td>onAnimationEnd</td>
          <td>function</td>
          <td>() => null</td>
          <td>called when animation finished</td>
        </tr>
        <tr>
          <td>attributeName</td>
          <td>string</td>
          <td>''</td>
          <td>style property</td>
        </tr>
        <tr>
          <td>easing</td>
          <td>string</td>
          <td>'ease'</td>
          <td>the animation timing function, support css timing function temporary</td>
        </tr>
        <tr>
          <td>isActive</td>
          <td>boolean</td>
          <td>true</td>
          <td>whether the animation is active</td>
        </tr>
        <tr>
          <td>children</td>
          <td>element</td>
          <td></td>
          <td>support only child temporary</td>
        </tr>
    </tbody>
</table>

### AnimateGroup

<table class="table table-bordered table-striped animate-group">
    <thead>
    <tr>
        <th style="width: 40px">name</th>
        <th style="width: 40px">type</th>
        <th style="width: 40px">default</th>
        <th style="width: 100px">description</th>
    </tr>
    </thead>
    <tbody>
        <tr>
          <td>appear</td>
          <td>object</td>
          <td>undefined</td>
          <td>configure element appear animation</td>
        </tr>
        <tr>
          <td>enter</td>
          <td>object</td>
          <td>undefined</td>
          <td>configure element appear animation</td>
        </tr>
        <tr>
          <td>leave</td>
          <td>object</td>
          <td>undefined</td>
          <td>configure element appear animation</td>
        </tr>
    </tbody>
</table>

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2015-2021 Recharts Group
