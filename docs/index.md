# OpenFn/devtools

A set of tools for writing &amp; testing expressions, managing OpenFn projects,
and developing new adaptors (language-packages).

## Up and running

1. Make sure you've got [git](https://git-scm.com/downloads) (maybe GitBash for Windows?)
2. And [Node.js](https://nodejs.org/en/download/) (version 6.11 or greater)
3. Run `git clone git@github.com:OpenFn/devtools.git` for SSH or `git clone https://github.com/OpenFn/devtools.git`
4. Run `cd devtools`
5. Run `./install.sh` to install core, language-common, and language-http

_Note: If you get a "permission denied" message when running `./install.sh`, try
`run chmod +x ./install.sh ` then retry the install command._

To install specific adaptors, run `./install.sh language-${name}`

You can run core from anywhere by using `npm install -g` for global install
`npm install -g github:openfn/core#master`

## Usage

Execute takes:

1. `-l [language-package].Adaptor`: The adaptor being used
2. `-e [expression.js]:` The expression being tested
3. `-s [state.json]`: The message `data: {...}` and credential `configuration: {...}`
4. `-o [output.json]`: The file to which the output will be written

### Bash usage

`./core/lib/cli.js execute -l ./language-[XXX].Adaptor -s ./tmp/state.json -o ./tmp/output.json -e ./tmp/expression.js`

### The `--test` option

`./core/lib/cli.js execute -l ./language-[XXX].Adaptor -s ./tmp/state.json -o ./tmp/output.json -e ./tmp/expression.js --test`

This intercepts all HTTP requests and displays the request information for
debugging.

#### `.FakeAdaptor`

`language-salesforce` has a built-in `.FakeAdaptor` which allows a user to test
expressions on data without sending them to a real Salesforce server.

Instead of using `-l ./language-salesforce.Adaptor`,
use `-l./language-salesforce.FakeAdaptor` to test expressions offline:
`./core/lib/cli.js execute -l ./language-salesforce.FakeAdaptor -s ./tmp/state.json -o ./tmp/output.json -e ./tmp/expression.js`

#### Offline testing for other `language-packages`

For most standard language packages, it's fairly easy to remove the HTTP post
calls from the top-level function.

## Modifying or developing new adaptors

_wip_

### Pre-Requisites

1. [Make](http://www.gnu.org/software/make/) is used so that our modern (es9)
   JavaScript can be run on older Node runtimes.
2. _wip_
