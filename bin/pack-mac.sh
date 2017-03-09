#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/build --mac --x64
mv './dist/Redmine Notifier-0.8.0.dmg' ./dist/mac/RedmineNotifierSetup-0.8.0.dmg
