#!/bin/bash
cd $(dirname $0)/..
$(npm bin)/build --platform=win32 --arch=x64 --dist
mv './dist/win/Redmine Notifier Setup 0.5.0.exe' ./dist/win/RedmineNotifierSetup.exe
