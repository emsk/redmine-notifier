#!/usr/bin/env bash
cd $(dirname $0)/..
$(npm bin)/build --platform=win32 --arch=x64
