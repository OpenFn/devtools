# [OpenFn/devtools](https://openfn.github.io/devtools/) [![CircleCI](https://circleci.com/gh/OpenFn/devtools.svg?style=svg)](https://circleci.com/gh/OpenFn/devtools)

**_To view the documentation please visit
[openfn.github.io/devtools](https://openfn.github.io/devtools/)._**

A set of tools for writing &amp; testing expressions, managing OpenFn projects,
and developing new adaptors.

## Up and running

1. Make sure you've got [git](https://git-scm.com/downloads) (maybe GitBash for
   Windows?)
2. And [Node.js](https://nodejs.org/en/download/) (version 6.11 or greater)
3. Run `git clone git@github.com:OpenFn/devtools.git` for SSH or
   `git clone https://github.com/OpenFn/devtools.git`
4. Run `cd devtools`
5. Run `./install.sh ssh` or `./install.sh https` to install core,
   language-common, and language-http

_Note: If you get a "permission denied" message when running `./install.sh`, try
`run chmod +x ./install.sh ` then retry the install command._

To install specific adaptors, run
`./install.sh ${ssh || https} language-${name}`

You can run core from anywhere by using `npm install -g` for global install
`npm install -g github:openfn/core#main`

**Now go read the [docs](https://openfn.github.io/devtools/)**
