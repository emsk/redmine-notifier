#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/build --win --x64
mv './dist/win/Redmine Notifier Setup 0.6.0.exe' ./dist/win/RedmineNotifierSetup.exe
