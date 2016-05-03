# Change Log 

## 0.5.0 (2016-05-03)

### Production

* Add notification icons
* Add "Open Most Recent Issue in Browser" to context menu
* Decrease useless access by keeping fetch mode
* Upgrade notie dependency to ^3.2.0
* Add `return this` for method chaining
* Fix `window.onload` -> `window.addEventListener('load')` for consistency
* Move 'use strict' to global scope
* Remove unused variables

### Development

* Upgrade electron-builder dependency to ^3.16.0
* Upgrade electron-prebuilt dependency to 0.37.8
* Remove electron-packager from package.json
* Introduce new cross-platform package options
* Remove unused configuration file for building installers
* Introduce eslint for linting JS file
* Introduce csslint for linting CSS file
* Add `npm run release`

## 0.4.0 (2016-01-17)

### Production

* Add fallback when Redmine API doesn't accept time format

### Development

* Avoid outputting a console message like "Couldn't set selectedTextBackgroundColor from default ()" when selecting text in the settings window
* Upgrade electron-prebuilt dependency to ^0.36.4

## 0.3.0 (2016-01-11)

### Production

* Add `Project ID` setting
* Tweak outline of buttons
* Change coding style of IIFE

### Development

* Extract build scripts
* Add `npm run prepare`
* Do not remove app/node_modules directory when building apps
* Remove verbose `clean` script
* Fix --ignore option
* Upgrade electron-builder and electron-prebuilt

## 0.2.0 (2015-12-27)

### Production

* Package app into asar archive
* Rename installer file
* Remove crash-reporter

### Development

* Ignore .DS_Store and npm-debug.log when building apps
* Run `rm -rf ./app/node_modules && npm install --prefix ./app` before packaging
* Upgrade devDependencies
