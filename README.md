# openfn-devtools
A set of tools for writing &amp; testing expressions, managing OpenFn projects,
and developing language-packages.

## Pre-Requisites
1. [Git](https://git-scm.com/downloads)
2. [Node.js](https://nodejs.org/en/download/) (6.5 or higher.)

## Basic offline job-runner usage
You can run fn-lang from anywhere by using `npm install -g` for global install:
`npm install -g github:openfn/fn-lang#v0.5.6`

## Installation
`git clone git@github.com:openfn/openfn-devtools.git`
`cd openfn-devtools`
`install_[windows.bat OR bash.sh]`

## Expression Testing Usage
Execute takes:
`-l [language-package].Adaptor`: The language-package.
`-e [expression.js]:` The expression being tested.
`-s [state.json]`: The message `data: {...}` and credential `configuration: {...}`.
`-o`[output.json]`: The file to which the output will be written.

### Bash usage
`./fn-lang/lib/cli.js execute -l ./language-[XXX].Adaptor -e ./tmp/expression.js -s ./tmp/state.json -o ./tmp/output.json`
### Windows usage
`node ./fn-lang/lib/cli.js execute -l ./language-[XXX].Adaptor -e ./tmp/expression.js -s ./tmp/state.json -o ./tmp/output.json`

#### `.FakeAdaptor`
`language-salesforce` has a built-in `.FakeAdaptor` which allows a user to test
expressions on data without sending them to a real Salesforce server. Instead of
using `-l ./language-salesforce.Adaptor`, use `-l ./language-salesforce.FakeAdaptor`
to test expressions offline.

#### Offline testing for other `language-packages`
For most standard language packages, it's fairly easy to remove the HTTP post
calls from the top-level function. Here's how to make the `event()` function for
`language-dhis2` work offline:
`cd language-dhis2`
edit `src/Adaptor.js` using `vim` or your favorite text editor and comment out
the `post().then()` from line 67-78:
```js
export function event(eventData) {

  return state => {
    const body = expandReferences(eventData)(state);

    const {
      username,
      password,
      apiUrl
    } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/events')

    console.log("Posting event:");
    console.log(body)

    // Commented out post().then() for offline testing.
    // return post({
    //     username,
    //     password,
    //     body,
    //     url
    //   })
    //   .then((result) => {
    //     console.log("Success:", result);
    //     return {...state,
    //       references: [result, ...state.references]
    //     }
    //   })

  }
}
```
`:wq` to save your work.
`make` to build.
`cd ../`
`./fn-lang/lib/cli.js execute -l ./language-dhis2.Adaptor -e ./tmp/expression.js -s ./tmp/state.json`
, assuming your expression calls `post()`.


## Modifying or Developing New `language-packages`
*wip*
### Pre-Requisites
1. [Make](http://www.gnu.org/software/make/)
*wip*
