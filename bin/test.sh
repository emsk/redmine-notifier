#!/usr/bin/env bash
cd $(dirname $0)/..
if [ ! -e './dist/osx/Redmine Notifier.app' ]; then
  $(npm bin)/build --osx --x64
fi
$(npm bin)/mocha
