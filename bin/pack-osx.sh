#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/build --osx --x64
mv './dist/osx/Redmine Notifier-0.5.0.dmg' ./dist/osx/RedmineNotifierSetup.dmg
