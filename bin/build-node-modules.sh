#!/bin/bash
cd `dirname $0`
rm -rf ../app/node_modules
npm install --prefix ../app
