#!/bin/bash
cd $(dirname $0)/..
$(npm bin)/textlint ./README.md ./CHANGELOG.md || exit 0
