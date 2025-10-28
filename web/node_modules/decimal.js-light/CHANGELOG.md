#### 2.5.1
* 30/09/2020
* Correct initial `sqrt` estimate.

#### 2.5.0
* 16/10/2018
* Add default export to *decimal.d.ts*.
* Add `Symbol.for('nodejs.util.inspect.custom')` to *decimal.mjs*.

#### 2.4.1
* 24/05/2018
* Add `browser` field to *package.json*.

#### 2.4.0
* 22/05/2018
* Amend *.mjs* exports.
* Remove extension from `main` field in *package.json*.

#### 2.3.1
* 13/11/2017
* Add constructor properties to typings.
* Amend `LN10` section of *doc/API.html*.

#### 2.3.0
* 26/09/2017
* Add *bignumber.mjs*.

#### 2.2.5
* 08/09/2017
* #5 Fix import.

#### 2.2.4
* 15/08/2017
* Add TypeScript type declaration file, *decimal.d.ts*
* Correct `toPositive` and `toNegative` examples

#### 2.2.3
* 04/05/2017
* Fix *README* badge

#### 2.2.2
05/04/2017
* `Decimal.default` to `Decimal['default']` IE8 issue

#### 2.2.1
10/03/2017
* Remove `tonum` from documentation

#### 2.2.0
10/01/2017
* Add `exponent` method

#### 2.0.2
12/12/2016
* npm publish

#### 2.0.1
12/12/2016
* Filename-casing issue

#### 2.0.0
11/12/2016
* Make `LN10` configurable at runtime
* Reduce `LN10` default precision
* Remove `ceil`, `floor`, `min`, `max` and `truncated`
* Rename `divToInt` to `idiv`, `toSD` to `tosd`, `toDP` to `todp`, `isInt` to `isint`, `isNeg` to `isneg`, `isPos` to `ispos` and `round` to `toInteger`
* Rename some test files
* Add `set` as alias to `config`
* Support ES6 import shims
* Add to README

#### 1.0.4
28/02/2016
* Add to README

#### 1.0.3
25/02/2016
* Add to README

#### 1.0.2
25/02/2016
* Correct url
* Amend .travis.yml as Node.js v0.6 doesn't include `process.hrtime` which is used in testing.

#### 1.0.0
24/02/2016
* Initial release
