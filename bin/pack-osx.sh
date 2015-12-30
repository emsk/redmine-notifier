#!/bin/bash
cd `dirname $0`
npm run build:osx
electron-builder '../dist/osx/Redmine Notifier-darwin-x64/Redmine Notifier.app' \
  --platform=osx \
  --out=../dist/osx \
  --config=../config.json
mv '../dist/osx/Redmine Notifier.dmg' ../dist/osx/RedmineNotifierSetup.dmg
