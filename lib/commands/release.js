const Listr = require('listr');
const execa = require('execa');
const path = require('path');
const np = require('../np');
const { stripIndent } = require('common-tags');
const logSymbols = require('log-symbols');

const { checkGithubToken, checkPackageJson } = require('../tasks');

const preflightTasks = new Listr([
  {
    title: 'Pre-flight checks',
    task: () => {
      return new Listr(
        [
          {
            title: 'Checking package.json',
            task: ({ adaptorPath }) => checkPackageJson(adaptorPath),
          },
          {
            title: 'Fetching from origin',
            task: ({ adaptorPath }) =>
              execa
                .stdout('git', ['fetch', 'origin'], { cwd: adaptorPath })
                .then(result => {
                  if (result !== '') {
                    throw new Error('Failed performing `git fetch origin`');
                  }
                }),
          },
          {
            title: 'Check for GH_TOKEN',
            task: checkGithubToken,
          },
        ],
        { concurrent: true }
      );
    },
  },
]);

async function handler(argv) {
  const adaptorPath = path.normalize(argv.path);

  try {
    await preflightTasks.run({ adaptorPath });
    try {
      const npResult = await np(adaptorPath, {
        publish: !argv.dryRun,
        anyBranch: argv.dryRun,
        '2fa': false,
      });
      if (!npResult) {
        throw new Error('Cancelled');
      }
    } catch (e) {
      if (e.message.match('Unclean working tree')) {
        console.log();
        console.log(
          logSymbols.info,
          stripIndent`
            This means there are files that are not ignored in your local
            repository - to ensure that the tests (or other code) isn't relying
            on uncommitted files.
            `
        );
      }
      throw e;
    }

    return `Done, run \`package-release -u ${argv.path}\` to upload the bundled build`;
  } catch (e_1) {
    process.exitCode = 10;
    console.error(e_1.message);
  }
}

exports.command = 'release [options] <path>';
exports.describe = 'build and release a new adaptor version';

exports.builder = function (yargs) {
  return yargs
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      description: "Run on any branch and don't actually upload to NPM/Github",
    })
    .positional('path', {
      describe: 'the local git repo of the adaptor',
      type: 'string',
    })

    .help('help');
};

exports.handler = handler;
