#!/usr/bin/env bash
cd $(dirname $0)/..
if [ ! -e './dist/mac/Redmine Notifier.app' ]; then
  $(yarn bin)/electron-builder --mac --x64 --publish never
fi
$(yarn bin)/ava
