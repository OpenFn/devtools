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

ECHO Done!

REM CATCH USER INPUTS
REM echo "Please enter some input: "
REM read input_variable
REM echo "You entered: $input_variable"
