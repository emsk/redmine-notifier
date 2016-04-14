#!/bin/bash
cd $(dirname $0)
npm install --prefix ../app
rm -rf ../dist/osx
$(npm bin)/electron-packager ../app 'Redmine Notifier' \
  --platform=darwin \
  --arch=x64 \
  --version=0.37.5 \
  --out=../dist/osx \
  --icon=../assets/osx/redmine_notifier.icns \
  --asar \
  --asar-unpack='**/app/{node_modules/node-notifier/vendor,images}/**' \
  --ignore='\.DS_Store|npm-debug\.log|^/etc' \
  --app-copyright='Copyright (c) 2015-2016 emsk' \
  --app-version='0.4.0' \
  --build-version='0.4.0'
