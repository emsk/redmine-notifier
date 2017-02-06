#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/textlint ./README.md ./CHANGELOG.md || exit 0
