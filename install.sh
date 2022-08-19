#!/usr/bin/env bash
# ==============================================================================
# Bash script to install OpenFn/devtools
# ==============================================================================

if [[ "$1" != "https" ]] && [[ "$1" != "ssh" ]]; then
  echo 'For initial setup, add ssh or https as your first argument:'
  echo '  ./install.sh ssh'
  echo '  ./install.sh https'
  echo ''
  echo 'To install a specific adaptor, add a second argument:'
  echo '  ./install.sh ssh language-dhis2'
  echo '  ./install.sh ssh language-salesforce'
  echo '  ./install.sh ssh language-__________'
  exit 1
fi

if [[ $1 = https ]]; then
  clone="git clone https://github.com/OpenFn"
elif [[ $1 = ssh ]]; then
  clone="git clone git@github.com:OpenFn"
fi

# Thing that checks to see if an adaptor is already installed at that path.
# if ./core exists, run npm install inside that directory
# if not, do the clone and npm install thing

# if ./adaptors/blah exists, run npm install inside that directoyr
# if not, do the clone and npm install thing

if [[ $2 ]]; then
  # install an adaptors if argument is provided
  echo installing $2...
  (cd ./adaptors/$2 && git pull) || $clone/$2.git ./adaptors/$2 &&
    npm install --prefix ./adaptors/$2 &&
    echo $2 adaptor installed ✓
else
  # base installation
  echo installing OpenFn/devtools...

  (cd ./core && git pull) || $clone/core.git &&
    npm install --prefix ./core &&
    echo OpenFn/core installed ✓

  (cd ./adaptors/language-common && git pull) || $clone/language-common.git ./adaptors/language-common &&
    npm install --prefix ./adaptors/language-common &&
    echo language-common adaptor installed ✓

  (cd ./adaptors/language-http && git pull) || $clone/language-http.git ./adaptors/language-http &&
    npm install --prefix ./adaptors/language-http &&
    echo language-http adaptor installed ✓

  mkdir -p tmp
  cp tmp.example/expression.js tmp
  cp tmp.example/state.json tmp

  echo OpenFn/devtools installed ✓
fi
