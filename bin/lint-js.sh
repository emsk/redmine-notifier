#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/eslint ./app/main.js ./app/index.js ./test/test.js || exit 0
