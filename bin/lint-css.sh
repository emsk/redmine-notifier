#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/stylelint ./app/stylesheets/index.css || exit 0
