# openfn-devtools
A set of tools for writing &amp; testing expressions, managing OpenFn projects,
and developing language-packages.

## Pre-Requisites
1. [Git](https://git-scm.com/downloads)
2. [Node.js](https://nodejs.org/en/download/)

## Installation
`git clone git@github.com:openfn/openfn-devtools.git`  
`cd openfn-devtools`
`install_[windows.bat OR bash.sh]`  

## Usage
Execute takes:  
`-l [language-package].Adaptor`: The language-package.
`-e [expression.js]:` The expression being tested.  
`-s [state.json]`: The message `data: {...}` and credential `configuration: {...}`.  

#### `.FakeAdaptor`
`language-salesforce` has a built-in `.FakeAdaptor` which allows a user to test
expressions on data without sending them to a real Salesforce server. Instead of
using `-l ./language-salesforce.Adaptor`, use `-l ./language-salesforce.FakeAdaptor`
to test expressions offline.

### Bash usage
`./fn-lang/lib/cli.js execute -l ./language-[XXX].Adaptor -e ./tmp/expression.js -s ./tmp/state.json`
### Windows usage
`node ./fn-lang/lib/cli.js execute -l ./language-[XXX].Adaptor -e ./tmp/expression.js -s ./tmp/state.json`
