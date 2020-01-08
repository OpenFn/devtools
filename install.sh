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
  echo $1 installed ✓
else
  # base installation
  echo installing openfn-devtools...
  git submodule init
  git submodule update

  cd language-common
  npm install
  echo language-common installed ✓
  cd ../

  cd language-http
  echo language-http installed ✓
  npm install
  cd ../

  cd core
  npm install
  cd ../

  mkdir tmp
  cd tmp

  cd ../

  echo openfn-devtools installed ✓
fi
