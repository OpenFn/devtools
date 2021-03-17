const path = require('path');
const { readyPackageJson, checkPackageJson, loadAdaptor } = require('../utils');
const logSymbols = require('log-symbols');
const { stripIndent } = require('common-tags');
const { writeFileSync } = require('fs');
const execa = require('execa');

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
    const rediedPackage = await readyPackageJson(packageJson);

    writeFileSync('/tmp/package.json', JSON.stringify(rediedPackage, null, 2));

    try {
      await execa('diff', [
        '--color=always',
        adaptorPath + '/package.json',
        '/tmp/package.json',
      ]);

      console.log(logSymbols.info, 'No changes.');
    } catch (e) {
      console.log(logSymbols.warning, 'Proposed changes:');
      console.log(e.stdout);

      if (argv.confirm) {
        writeFileSync(
          `${adaptorPath}/package.json`,
          JSON.stringify(rediedPackage, null, 2)
        );
      } else {
        console.log(logSymbols.info, "Run again with the --confirm option to write these changes.");
      }
    }

    // console.log(checkPackageJson(rediedPackage));
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
