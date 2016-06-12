#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/build --win --x64
