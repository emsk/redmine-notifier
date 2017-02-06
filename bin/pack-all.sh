#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/build --mac --win --x64
mv './dist/mac/Redmine Notifier-0.7.1.dmg' ./dist/mac/RedmineNotifierSetup-0.7.1.dmg
mv './dist/win/Redmine Notifier Setup 0.7.1.exe' ./dist/win/RedmineNotifierSetup-0.7.1.exe
