#!/bin/bash
cd $(dirname $0)/..
if [ ! -e './dist/Redmine Notifier-darwin-x64/Redmine Notifier.app' ]; then
  $(npm bin)/build --platform=darwin --arch=x64
fi
$(npm bin)/mocha
