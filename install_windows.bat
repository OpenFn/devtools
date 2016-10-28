::CMD will no longer show us what command it’s executing(cleaner)
ECHO OFF

:: Print some text
ECHO Setting up openfn-devtools...
cd language-common
npm install
cd ../
cd fn-lang
npm install
npm link ../language-common
cd ../
ECHO Press any key to start using openfn-devtools
PAUSE
:: Give the user some time to see the results. Because this is our last line, the program will exit and the command window will close once this line finishes.
ECHO node ./lib/cli.js execute -l ../language-salesforce.FakeAdaptor -e ./tmp/expression.js -s ./tmp/state.json
