#!/bin/bash
# Bash setup script for openfn-devtools

echo Setting up openfn-devtools...
git submodule init
git submodule update

cd language-common
npm install
cd ../

cd fn-lang
npm install
cd ../

echo Done!
