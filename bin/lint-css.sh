#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/stylelint ./app/stylesheets/index.css || exit 0
