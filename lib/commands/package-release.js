const { normalize } = require('path');
const packageRelease = require('../tasks/package-release');

async function handler(argv) {
  const adaptorPath = normalize(argv.path);

  try {
    return packageRelease({ adaptorPath, uploadToGithub: argv.upload }).run();
  } catch (e) {
    process.exitCode = 1;

    if (argv.debug) {
      console.error(e);
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
    .option('upload', {
      alias: 'u',
      type: 'boolean',
      default: false,
      describe: 'upload the resulting tarball to github, requires GH_TOKEN',
    })
    .option('debug', {
      alias: 'd',
      default: false,
      type: 'boolean',
    })

    .help('help');
};

exports.handler = handler;
