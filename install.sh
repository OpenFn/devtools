#!/bin/bash
# ==============================================================================
# Bash script to install openfn-devtools
# ==============================================================================

if [[ $1 ]]; then
  # install a language-package if argument is provided
  echo installing $1...
  git clone https://github.com/OpenFn/$1.git
  cd $1
  npm install
  cd ../
  echo adaptor $1 installed ✓
else
  # base installation
  echo installing openfn-devtools...
  git clone https://github.com/OpenFn/core.git
  git clone https://github.com/OpenFn/language-common.git
  git clone https://github.com/OpenFn/language-http.git
  
  cd core
  npm install
  echo OpenFn/core installed ✓
  cd ../
  
  cd language-common
  npm install
  echo common adaptor installed ✓
  cd ../
  
  cd language-http
  echo http adaptor installed ✓
  npm install
  cd ../
  
  mkdir tmp
  cp tmp.example/expression.js tmp
  cp tmp.example/state.json tmp
  
  echo openfn-devtools installed ✓
fi
