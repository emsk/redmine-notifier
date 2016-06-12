#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/build --osx --x64
