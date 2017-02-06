#!/usr/bin/env bash
cd $(dirname $0)/..
if [ ! -e './dist/mac/Redmine Notifier.app' ]; then
  $(yarn bin)/build --mac --x64
fi
$(yarn bin)/mocha
