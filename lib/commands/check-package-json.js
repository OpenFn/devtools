const execa = require('execa');
const inquirer = require('inquirer');
const logSymbols = require('log-symbols');
const path = require('path');

const { readyPackageJson, checkPackageJson, loadAdaptor } = require('../utils');
const { stripIndent } = require('common-tags');
const { writeFileSync } = require('fs');

async function handler(argv) {
  const adaptorPath = path.normalize(argv.path);

  const packageJson = loadAdaptor(adaptorPath);

  if (!argv.fix) {
    const errors = checkPackageJson(packageJson);

    if (errors.length == 0) {
      console.log(
        logSymbols.success,
        stripIndent`
      No issues found.
      `
      );
    } else {
      console.log('Got the following issues:');
      console.log(
        errors.map(e => `${logSymbols.error} ${e.message}`).join('\n')
      );
    }
  } else {
    const readiedPackage = await readyPackageJson(packageJson);

    writeFileSync('/tmp/package.json', JSON.stringify(readiedPackage, null, 2) + `\n`);

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

      let uploadToGithub = argv.confirm;

      if (!argv.confirm) {
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
            uploadToGithub = confirmed;
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

      if (uploadToGithub) {
        writeFileSync(
          `${adaptorPath}/package.json`,
          JSON.stringify(readiedPackage, null, 2)
        );
      }
    }
  }
}

exports.command = 'check-package-json [options] <path>';
exports.describe =
  "Checks a package.json to see if it's in line with the other packages";

exports.builder = function (yargs) {
  return yargs
    .option('fix', {
      alias: 'f',
      type: 'boolean',
      default: false,
      description: 'Propose some fixes',
    })
    .option('confirm', {
      alias: 'c',
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
