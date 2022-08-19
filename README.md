# OpenFn/devtools [![CircleCI](https://circleci.com/gh/OpenFn/devtools.svg?style=svg)](https://circleci.com/gh/OpenFn/devtools)

A set of tools for writing &amp; testing expressions, managing OpenFn projects,
and developing new adaptors.

## [Documentation](https://docs.openfn.org/documentation/devtools/home)

_🔥 The documentation for this project can be found at
[docs.openfn.org](https://docs.openfn.org/documentation/devtools/home). 🔥_

## Up and running

1. Make sure you've got [git](https://git-scm.com/downloads) (maybe GitBash for
   Windows?)
2. And [Node.js](https://nodejs.org/en/download/) (version 12 or greater)
3. Run `git clone git@github.com:OpenFn/devtools.git` for SSH or
   `git clone https://github.com/OpenFn/devtools.git`
4. Run `cd devtools`
5. Run `./install.sh ssh` or `./install.sh https` to install core,
   language-common, and language-http

_Note: If you get a "permission denied" message when running `./install.sh`, run
`chmod +x ./install.sh` then retry the install command._

To install specific adaptors, run
`./install.sh ${ssh || https} language-${name}`

To interactively generate a project configuration yaml, run
`./scripts/generate-project.js`

You can run core from anywhere by using `npm install -g` for global install
`npm install -g github:openfn/core#main`

## Usage

Read the docs at
[docs.openfn.org](https://docs.openfn.org/documentation/devtools/home).

`execute` takes:

1. `-l [language-xyz].Adaptor`: The adaptor being used
2. `-e [expression.js]:` The expression being tested
3. `-s [state.json]`: The message `data: {...}` and
   credential`configuration: {...}`
4. `-o [output.json]`: The file to which the output will be written

Run a job like this:

```sh
./core/bin/core execute \
  -l ./adaptors/language-XXXXXXX/ \
  -s ./tmp/state.json \
  -o ./tmp/output.json \
  -e ./tmp/expression.js
```

## Deploying Adaptors

**CLI**

Using the CLI via `./bin/cli`:

- release
- package-release
- check-package-json

**via Docker**

```sh
docker build -t dev
docker run --rm -it \
  --name devtools \
  -e GH_TOKEN=$GH_TOKEN \
  -v $PWD:/opt \
  -v $(realpath ../adaptor):/tmp/adaptor \
  devtools \
  cli release /tmp/adaptor
```
