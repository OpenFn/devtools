# openfn-devtools
A set of tools for writing &amp; testing expressions, managing OpenFn projects,
and developing language-packages.

## Pre-Requisites
Make sure you have Node.js and Git installed.  
https://nodejs.org/en/download/  
https://git-scm.com/downloads  

## Installation
`git clone git@github.com:openfn/openfn-devtools.git`  
`cd openfn-devtools`
`install_[windows.bat OR bash.sh]`  

## Usage
Execute takes:  
`-l [language-pack]`: The language-pack. Note that language-salesforce has a `.FakeAdaptor` that can be used to test expressions without connecting to the server.  
`-e [expression.js]:` The expression being tested.  
`-s [state.json]`: The message `data: {...}` and credential `configuration: {...}`.  

### Bash
`./fn-lang/lib/cli.js execute -l ./language-[XXX] -e ./tmp/expression.js -s ./tmp/state.json`
### Windows
`node ./fn-lang/lib/cli.js execute -l ./language-[XXX] -e ./tmp/expression.js -s ./tmp/state.json`

## installation
0.
1. cd fn-lang
2. npm link ../language-salesforce
3. npm link ../language-common
