# Change Log 

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
