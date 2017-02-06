#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/build --win --x64
mv './dist/win/Redmine Notifier Setup 0.7.1.exe' ./dist/win/RedmineNotifierSetup-0.7.1.exe
