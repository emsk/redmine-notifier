#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/build --platform=darwin --arch=x64 --dist
mv './dist/Redmine Notifier-darwin-x64/Redmine Notifier-0.5.0.dmg' './dist/Redmine Notifier-darwin-x64/RedmineNotifierSetup.dmg'
