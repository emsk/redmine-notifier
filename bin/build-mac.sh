#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/build --mac --x64
