## 3.0.0 / 2023-10-18

### refactor / chore

- upgrade dependencies

# BREAKING CHANGE

Remove some unused/unneeded code which drops support for older browser versions. Results in slightly decreased bundle size.

- remove unneeded polyfill for translateStyle - [browser support since 2017](https://caniuse.com/?search=transforms)
- remove unneeded polyfill for `Number.isFinite` - [browser support since 2015](https://caniuse.com/?search=Number.isFinite) AND polyfilled by babel/core-js

## 2.0.5 / 2023-10-10

### fix

- Check if `requestAnimationFrame` is defined in shouldUpdate

## 2.0.4 / 2023-09-12

### fix

- call `onAnimationEnd` on unmount

## 2.0.3 / 2023-05-08

### fix

- treat `duration={0}` as if animation is not active by doing a check and returning early. This fixes a bug where NaN can cause a crash in the browser.

## 2.0.2 / 2023-02-23

### chore

- upgrade `fast-equals` to latest. No breaking changes - see https://github.com/planttheidea/fast-equals/blob/master/CHANGELOG.md
- don't upgrade `react-transition-group` in minor release as this requires dropping support for react <16.6
- upgrade devDependencies
- update babel config
- update deprecated eslint parser

## 2.0.1 / 2022-06-27

### feat

- feat: allow React 18
- Remove raf polyfill for IE9

## 2.0.0 / 2021-03-21

### chore (#48)

- Changed peerDeps to react 15,16,17
- Removed karma,chai,enzyme blablabla... and used only Jest and Testing-Library.
- Updated devDependencies and cleared some.

## 1.0.2 / 2018-10-02

### fix

- fix babelrc

## 1.0.1 / 2018-10-02

### fix

- update babel, webpack, karma, etc.
- fix import error

## 1.0.0 / 2017-11-06

### feat

- Support React 16

## 0.1.17 / 2016-12-02

### fix

- change scripts

## 0.1.16 / 2016-11-25

### fix

- update lodash

## 0.1.15 / 2016-10-31

### fix

- fix isMounted to mounted

## 0.1.14 / 2016-10-28

### fix

- fix: judge isMounted

## 0.1.12-0.1.13 / 2016-10-27

### fix

- fix script

## 0.1.10 / 2016-07-07

### fix

- add onAnimationReStart validation

## 0.1.8-0.1.9 / 2016-05-05

### feat

- add onAniamtionStart prop

## 0.1.7 / 2016-04-21

### fix

- fix Animate trigger animate when isActive is false

## 0.1.6 / 2016-04-15

### fix

- fix Animate not pipe props when Animate not active

## 0.1.5 / 2016-04-13

### fix

- remove pure-render-decorator

## 0.1.4 / 2016-04-12

### fix

- change transition-group addons to dependencies

## 0.1.3 / 2016-04-12

### refactor

- refactor AnimateManager

## 0.1.2 / 2016-04-12

### feat

- use owe PureRender util

### fix

- update react to 15.0.0

## 0.1.1 / 2016-04-05

### feat

- add shouldReAnimate prop

## 0.1.0 / 2016-03-16

### feat

- use webpack 2

## 0.0.13-0.0.15 / 2016-03-15

### fix

- using isEqual in lodash and remove isEqual in utils

## 0.0.13-0.0.14 / 2016-03-15

### fix

- fix update animation judgement

## 0.0.12 / 2016-03-15

### fix

- fix compatable prefix in transition property

### refactor

- refactor some function in utils
- using JSX instead of createElement

## 0.0.11 / 2016-03-01

### fix

- fix haven't unsubscribe handleStyleChange

## 0.0.10 / 2016-02-17

### refactor

- remove lodash compose method
- refactor configUpdate.js

## 0.0.9 / 2016-02-05

### fix

- fix don't build on npm publish

## 0.0.8 / 2016-02-05

### fix

- fix lodash minify problem

## 0.0.7 / 2016-02-04

### fix

- optimize npm script commands

## 0.0.6 / 2016-02-04

### fix

- set min time longer

## 0.0.5 / 2016-02-04

### fix

- fix animation not valid for set css styles too quick.

## 0.0.4 / 2016-02-02

### fix

- support onAnimationEnd in js animation

## 0.0.3 / 2016-02-02

### refactor

- refactor the import path of lodash function
- update webpack.config.js

## 0.0.2 / 2016-02-02

### feat

- support js animation
- support bezier and spring timing function
- support group animation

## 0.0.1 / 2016-01-21

- Init the project
