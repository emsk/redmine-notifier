#!/bin/bash
cd $(dirname $(dirname $0))
npm install
npm install --prefix ./app
