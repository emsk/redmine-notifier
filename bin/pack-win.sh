#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/electron-builder --win --x64 --publish never
mv './dist/squirrel-windows/Redmine Notifier Setup 0.8.0.exe' ./dist/squirrel-windows/RedmineNotifierSetup-0.8.0.exe
