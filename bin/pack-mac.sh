#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/build --mac --x64
mv './dist/mac/Redmine Notifier-0.7.1.dmg' ./dist/mac/RedmineNotifierSetup-0.7.1.dmg
