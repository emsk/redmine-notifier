#!/bin/bash
cd $(dirname $0)/..
$(npm bin)/build --platform=win32 --arch=x64 --dist
mv './dist/win-x64/Redmine NotifierSetup-0.4.0.exe' ./dist/win-x64/RedmineNotifierSetup.exe
