#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/textlint "./*.md" || exit 0
