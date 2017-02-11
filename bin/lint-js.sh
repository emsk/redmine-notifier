#!/usr/bin/env bash
cd $(dirname $0)/..
$(yarn bin)/xo || exit 0
