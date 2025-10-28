# VictoryVendor

Vendored dependencies for Victory.

## Background

D3 has released most of its libraries as ESM-only. This means that consumers in Node.js applications can no longer just `require()` anything with a d3 transitive dependency, including much of Victory.

To help provide an easy path to folks still using CommonJS in their Node.js applications that consume Victory, we now provide this package to vendor in various d3-related packages.

## Packages

We presently provide the following top-level libraries:
<!-- cat packages/victory-vendor/package.json | egrep '"d3-' | egrep -o 'd3-[^"]*'| sor t-->

- d3-ease
- d3-interpolate
- d3-scale
- d3-shape
- d3-timer

This is the total list of top and transitive libraries we vendor:
<!-- ls packages/victory-vendor/lib-vendor | sort -->

- d3-array
- d3-color
- d3-ease
- d3-format
- d3-interpolate
- d3-path
- d3-scale
- d3-shape
- d3-time
- d3-time-format
- d3-timer
- internmap

Note that this does _not_ include the following D3 libraries that still support CommonJS:

- d3-voronoi

## How it works

We provide two alternate paths and behaviors -- for ESM and CommonJS

### ESM

If you do a Node.js import like:

```js
import { interpolate } from "victory-vendor/d3-interpolate";
```

under the hood it's going to just re-export and pass you through to `node_modules/d3-interpolate`, the **real** ESM library from D3.

### CommonJS

If you do a Node.js import like:

```js
const { interpolate } = require("victory-vendor/d3-interpolate");
```

under the hood it's going to will go to an alternate path that contains the transpiled version of the underlying d3 library to be found at `victory-vendor/lib-vendor/d3-interpolate/**/*.js`. This futher has internally consistent import references to other `victory-vendor/lib-vendor/<pkg-name>` paths.

Note that for some tooling (like Jest) that doesn't play well with `package.json:exports` routing to this CommonJS path, we **also** output a root file in the form of `victory-vendor/d3-interpolate.js`.

## Licenses

This project is released under the MIT license, but the vendor'ed in libraries include other licenses (e.g. ISC) that we enumerate in our `package.json:license` field.
