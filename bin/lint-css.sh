#!/bin/bash
cd $(dirname $0)/..
$(npm bin)/csslint ./app/stylesheets/index.css
