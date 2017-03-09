#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/build --mac --win --x64
mv './dist/Redmine Notifier-0.8.0.dmg' ./dist/mac/RedmineNotifierSetup-0.8.0.dmg
mv './dist/win/Redmine Notifier Setup 0.8.0.exe' ./dist/win/RedmineNotifierSetup-0.8.0.exe
