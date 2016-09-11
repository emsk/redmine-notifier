# Change Log 

## 0.7.1 (2016-09-11)

### Production

* Fix errors that occur when a new entry form is added

## 0.7.0 (2016-09-10)

### Production

* Enable to store a lot of settings
* Change timing of clearing sub notification
* Update animated GIF of Windows installer
* Fix whitespace in the settings window title
* Fix redundant save message
* Change CSS properties in alphabetical order
* Update to Electron 1.3.5
* Update notie dependency to 3.9.4
* Update node-notifier dependency to ^4.6.1

### Development

* Add version to suffix of installer filename
* Update electron-prebuilt dependency to 1.3.5
* Update electron-builder dependency to ~6.6.1
* Update spectron dependency to ~3.3.0
* Update mocha dependency to ^3.0.2
* Update eslint dependency to ^3.5.0
* Update csslint dependency to ^1.0.2
* Update textlint dependency to ^7.1.1

## 0.6.0 (2016-07-10)

### Production

* Update to Electron 1.2.6
* Change animated GIF to display during install (Windows only)
* Change syntax to ES2015
* Replace `for` statement with `filter()`
* Remove verbose `label` and `accelerator` options in `MenuItem`

### Development

* Update electron-prebuilt dependency to 1.2.6
* Update electron-builder dependency to ~5.12.0
* Add simple tests using spectron, mocha, chai, and chai-as-promised
* Add textlint for linting Markdown file
* Update eslint dependency to ^3.0.1
* Add eslint rules for jsdoc
* Change `#!/bin/bash` -> `#!/usr/bin/env bash` for flexibility

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
