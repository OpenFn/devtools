:: Windows setup script for openfn-devtools


ECHO Setting up openfn-devtools...
git submodule init
git submodule update

cd language-common
npm install
cd ../

cd fn-lang
npm install
cd ../

git clone git@github.com:OpenFn/language-salesforce.git
cd language-salesforce
npm install
cd ../

ECHO Done! Run `node ./fn-lang/lib/cli.js execute -l ./language-salesforce.FakeAdaptor -e ./tmp/expression.js -s ./tmp/state.json` to see openfn-devtools in action.
