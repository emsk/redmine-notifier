#!/bin/bash
cd $(dirname $0)/..
$(npm bin)/build --platform=darwin --arch=x64
