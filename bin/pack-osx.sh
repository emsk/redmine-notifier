#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/build --platform=darwin --arch=x64 --dist
mv './dist/osx/Redmine Notifier-0.5.0.dmg' ./dist/osx/RedmineNotifierSetup.dmg
