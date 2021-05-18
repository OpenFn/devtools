const path = require('path');
const logSymbols = require('log-symbols');
const inquirer = require('inquirer');
const execa = require('execa');
const { writeFileSync } = require('fs');
const {
  readyPackageJson,
} = require('../utils/package-check');
const { loadAdaptor } = require('../utils');

async function handler(argv) {
  try {
    const adaptorPath = path.normalize(argv.path);

    const packageJson = loadAdaptor(adaptorPath);
    const readiedPackage = await readyPackageJson(packageJson);

    writeFileSync(
      '/tmp/package.json',
      JSON.stringify(readiedPackage, null, 2) + `\n`
    );
  } catch (error) {
    console.log(logSymbols.error, error.message);
    process.exitCode = 1;
    return false;
  }

  try {
    await execa('diff', [
      '--color=always',
      adaptorPath + '/package.json',
      '/tmp/package.json',
    ]);

    // diff returns a zero exit code when the diff is empty.
    console.log(logSymbols.info, 'No changes.');
  } catch (e) {
    console.log(logSymbols.warning, 'Proposed changes:');
    console.log(e.stdout);

    let canWriteChanges = argv.force;

    if (!argv.force) {
      await inquirer
        .prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: 'Do you want to write these changes to package.json?',
            default: true,
          },
        ])
        .then(({ confirmed }) => {
          canWriteChanges = confirmed;
        })
        .catch(error => {
          if (error.isTtyError) {
            console.log(
              logSymbols.info,
              'Run again with the --confirm option to write these changes.'
            );
          } else {
            console.error(error);
          }
        });
    }

    if (canWriteChanges) {
      writeFileSync(
        `${adaptorPath}/package.json`,
        JSON.stringify(readiedPackage, null, 2) + `\n`
      );
    }
  }
}

exports.command = 'check-package-json [options] <path>';
exports.describe =
  "Checks a package.json to see if it's in line with the other packages";

exports.builder = function (yargs) {
  return yargs
    .option('force', {
      alias: 'f',
      type: 'boolean',
      default: false,
      description: 'Just fix it, no questions.',
    })
    .positional('path', {
      describe: 'the local git repo of the adaptor',
      type: 'string',
    })

    .help('help');
};

exports.handler = handler;
