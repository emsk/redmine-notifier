#!/bin/bash
cd `dirname $0`
npm install --prefix ../app
rm -rf ../dist/win
electron-packager ../app 'Redmine Notifier' \
  --platform=win32 \
  --arch=x64 \
  --version=0.36.2 \
  --out=../dist/win \
  --icon=../assets/win/redmine_notifier.ico \
  --asar \
  --asar-unpack='**/app/{node_modules/node-notifier/vendor,images}/**' \
  --ignore='\.DS_Store|npm-debug\.log|^/etc' \
  --version-string.CompanyName='emsk' \
  --version-string.LegalCopyright='Copyright (c) 2015 emsk' \
  --version-string.FileDescription='Redmine Notifier' \
  --version-string.OriginalFilename='' \
  --version-string.FileVersion='0.2.0' \
  --version-string.ProductVersion='0.2.0' \
  --version-string.ProductName='Redmine Notifier' \
  --version-string.InternalName=''
