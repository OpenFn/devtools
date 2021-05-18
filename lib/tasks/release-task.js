const execa = require('execa');
const { getNextVersion } = require('../utils/versioning');
const { loadAdaptor } = require('../utils');

async function publish({ adaptorPath, dryRun, noBump }) {
  const npmPrefix = await execa.stdout('npm', ['config', 'get', 'prefix']);
  console.log('npmPrefix', npmPrefix);

  await execa(
    'sh',
    [
      '-c',
      `npm publish --prefix ${npmPrefix} --access=public${
        dryRun ? ' --dry-run' : ''
      }`,
    ],
    {
      cwd: adaptorPath,
      env: process.env,
    }
  ).stdout.pipe(process.stdout);
}

async function bumpVersion({ adaptorPath, bumpType }) {
  if (!bumpType) {
    throw new Error('Version bumpType required for versionTask.');
  }

  await execa('sh', ['-c', `npm version ${bumpType}`], {
    cwd: adaptorPath,
  }).stdout.pipe(process.stdout);

  await execa('sh', ['-c', `git push && git push --tags`], {
    cwd: adaptorPath,
  }).stdout.pipe(process.stdout);
}

module.exports = async function releaseTask({ adaptorPath, noBump, dryRun }) {
  const { version } = loadAdaptor(adaptorPath);

  if (!noBump) {
    const bumpType = await getNextVersion(version);
    await bumpVersion({ adaptorPath, bumpType });
  }

  return await publish({ adaptorPath, dryRun });
};
