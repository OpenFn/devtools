const path = require('path');
const { stripIndent } = require('common-tags');
const logSymbols = require('log-symbols');
const releaseTask = require('../tasks/release-task');

async function handler(argv) {
  const adaptorPath = path.normalize(argv.path);

  try {
    return await releaseTask({
      adaptorPath,
      noBump: argv.noBump,
      dryRun: argv.dryRun,
    });
  } catch (e) {
    try {
      if (e.message.match('working directory not clean')) {
        console.log();
        console.log(
          logSymbols.info,
          stripIndent`
          Looks like there are files that are not ignored in your local
          repository - to ensure that the tests (or other code) isn't relying
          on uncommitted files.
          `
        );
      }

      if (e.message.match('in package.json')) {
        console.log();
        console.log(
          logSymbols.warning,
          stripIndent`
          There is an issue with the package.json file.

          Run \`check-package-json -f\` on the devtools CLI to fix it.
          `
        );
      }

      if (e.message.match('NPM login status')) {
        console.log();
        console.log(
          logSymbols.info,
          stripIndent`
          Either use \`npm login\`, or add a .npmrc file like this to your home directory:

          //registry.npmjs.org/:_authToken=\${NPM_TOKEN}
        `
        );
      }
      process.exitCode = 1;

      if (argv.debug) {
        console.error(e);
      }

      return false;
    } catch (_e) {
      throw e;
    }
  }
}

exports.command = 'release [options] <path>';
exports.describe = 'build and release a new adaptor version';

exports.builder = function (yargs) {
  return yargs
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description: "Don't publish to NPM",
    })
    .option('no-bump', {
      alias: 'n',
      type: 'boolean',
      default: false,
      description: "Don't bump the package version",
    })
    .option('debug', {
      alias: 'd',
      type: 'boolean',
      default: true,
      description: 'Enable debug logging',
    })
    .positional('path', {
      describe: 'the local git repo of the adaptor',
      type: 'string',
    })

    .help('help');
};

exports.handler = handler;
