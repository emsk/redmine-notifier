#!/bin/bash
cd $(dirname $0)/..
$(npm bin)/eslint ./app/main.js ./app/index.js ./test/test.js || exit 0
