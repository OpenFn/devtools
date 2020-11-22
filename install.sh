#!/bin/bash
# ==============================================================================
# Bash script to install OpenFn/devtools
# ==============================================================================

if [[ $1 = https ]]; then
  clone="git clone https://github.com/OpenFn"
elif [[ $1 = ssh ]]; then
  clone="git clone git@github.com:OpenFn"
fi

if [[ $2 ]]; then
  # install an adaptors if argument is provided
  echo installing $2...
  $clone/$2.git ./adaptors/$2|| (cd ./core ; git pull) \
    && npm install --prefix ./adaptors/$2 \
    && echo $2 adaptor installed ✓
else
  # base installation
  echo installing OpenFn/devtools...
  
  $clone/core.git || (cd ./core ; git pull) \
    && npm install --prefix ./core \
    && echo OpenFn/core installed ✓

  $clone/language-common.git ./adaptors/language-common || (cd ./core ; git pull) \
    && npm install --prefix ./adaptors/language-common \
    && echo language-common adaptor installed ✓
  
  $clone/language-http.git ./adaptors/language-http || (cd ./core ; git pull) \
    && npm install --prefix ./adaptors/language-common \
    && echo language-http adaptor installed ✓  
  
  mkdir -p tmp
  cp tmp.example/expression.js tmp
  cp tmp.example/state.json tmp
  
  echo OpenFn/devtools installed ✓
fi