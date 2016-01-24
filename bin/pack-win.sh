#!/bin/bash
cd $(dirname $0)
npm run build:win
$(npm bin)/electron-builder '../dist/win/Redmine Notifier-win32-x64' \
  --platform=win \
  --out=../dist/win \
  --config=./config.json
mv '../dist/win/Redmine Notifier Setup.exe' ../dist/win/RedmineNotifierSetup.exe
