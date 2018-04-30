#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/electron-builder --mac --x64 --publish never
mv './dist/Redmine Notifier-0.8.0.dmg' ./dist/mac/RedmineNotifierSetup-0.8.0.dmg
mv './dist/Redmine Notifier-0.8.0.dmg.blockmap' ./dist/mac
mv ./dist/latest-mac.yml ./dist/mac
