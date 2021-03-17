const { normalize } = require("path");
const { packageRelease, ContextualError } = require('../tasks');

async function handler(argv) {
  const adaptorPath = normalize(argv.path);

  try {
    return packageRelease({ adaptorPath, uploadToGithub: true }).run();
  } catch (e) {
    if (e instanceof ContextualError) {
      console.log(e.ctx.details);
      process.exitCode = 10;
    } else {
      process.exitCode = 1;
    }

    if (argv.debug) {
      console.error(e);
    }
  }
}

exports.command = 'package-release [path]';

exports.describe = 'packages a tarball with all production dependencies baked in';

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
      describe: 'upload the resulting tarball to github, requires GH_TOKEN'
    })
    .option('debug', {
      alias: 'd',
      type: 'boolean'
    })

    .help('help');
};

exports.handler = handler;
