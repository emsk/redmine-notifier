# Change Log 

## 0.5.0 (2016-05-03)

### Production

* Add notification icons
* Add "Open Most Recent Issue in Browser" to context menu
* Decrease useless access by keeping fetch mode
* Update notie dependency to ^3.2.0
* Add `return this` for method chaining
* Change `window.onload` -> `window.addEventListener('load')` for consistency
* Change `'use strict'` to global scope
* Remove unused variables
* Update to Electron 0.37.8

### Development

* Update electron-builder dependency to ^3.16.0
* Remove electron-packager from package.json
* Add new cross-platform package options
* Remove unused configuration file for building installers
* Add eslint for linting JS file
* Add csslint for linting CSS file
* Add `npm run release`
* Update electron-prebuilt dependency to 0.37.8

## 0.4.0 (2016-01-17)

### Production

* Add fallback when Redmine API doesn't accept time format
* Update to Electron 0.36.4

### Development

* Avoid outputting a console message like "Couldn't set selectedTextBackgroundColor from default ()" when selecting text in the settings window
* Update electron-prebuilt dependency to ^0.36.4

## 0.3.0 (2016-01-11)

### Production

* Add `Project ID` setting
* Tweak outline of buttons
* Change coding style of IIFE
* Update to Electron 0.36.3

### Development

* Extract build scripts
* Add `npm run prepare`
* Do not remove app/node_modules directory when building apps
* Remove verbose `clean` script
* Fix `--ignore` option
* Update electron-builder dependency to ^2.6.0
* Update electron-prebuilt dependency to ^0.36.3

## 0.2.0 (2015-12-27)

### Production

* Package app into asar archive
* Rename installer file
* Remove crash-reporter
* Update to Electron 0.36.2

### Development

* Ignore .DS_Store and npm-debug.log when building apps
* Run `rm -rf ./app/node_modules && npm install --prefix ./app` before packaging
* Update electron-builder dependency to ^2.5.0
* Update electron-packager dependency to ^5.2.0
* Update electron-prebuilt dependency to ^0.36.2
