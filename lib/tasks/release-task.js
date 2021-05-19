const execa = require('execa');
const { getNextVersion } = require('../utils/versioning');
const { loadAdaptor } = require('../utils');

async function withStdout(subprocess) {
  subprocess.stdout.pipe(process.stdout);
  return await subprocess;
}

async function publish({ adaptorPath, dryRun, noBump }) {
  const npmPrefix = (await execa('npm', ['config', 'get', 'prefix'])).stdout;

  await withStdout(
    execa(
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
    )
  );
}

async function bumpVersion({ adaptorPath, bumpType }) {
  if (!bumpType) {
    throw new Error('Version bumpType required for versionTask.');
  }

  const commitMsg =
    '\n\n' +
    (
      await execa(
        'sh',
        [
          '-c',
          'git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%h %s"',
        ],
        { cwd: adaptorPath }
      )
    ).stdout;

  await withStdout(
    execa('sh', ['-c', `npm version ${bumpType} -m "${commitMsg}"`], {
      cwd: adaptorPath,
    })
  );

  return withStdout(
    execa('sh', ['-c', `git push && git push --tags`], {
      cwd: adaptorPath,
    })
  );
}

module.exports = async function releaseTask({ adaptorPath, noBump, dryRun }) {
  const { version } = loadAdaptor(adaptorPath);

  if (!noBump) {
    const bumpType = await getNextVersion(version);
    await bumpVersion({ adaptorPath, bumpType });
  }

  return await publish({ adaptorPath, dryRun });
};
