const logSymbols = require('log-symbols');
const { normalize } = require('path');
const packageRelease = require('../tasks/package-release');

async function handler(argv) {
  const adaptorPath = normalize(argv.path);

  try {
    return await packageRelease({ adaptorPath, skipUpload: argv.skipUpload });
  } catch (e) {
    process.exitCode = 1;

    if (argv.debug) {
      console.error(e);
    } else {
      console.error(logSymbols.error, `An error occured, use -d option for more detail: \n ${e.message}`);
    }
  }
}

exports.command = 'package-release [path]';

exports.describe =
  'packages a tarball with all production dependencies baked in';

exports.builder = function (yargs) {
  return yargs
    .positional('path', {
      describe: 'the local git repo of the adaptor',
      type: 'string',
      default: '.',
    })
    .option('skip-upload', {
      type: 'boolean',
      default: false,
      describe: "don't upload the resulting tarball to Github",
    })
    .option('debug', {
      alias: 'd',
      default: false,
      type: 'boolean',
    })

    .help('help');
};

exports.handler = handler;
