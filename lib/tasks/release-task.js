const Listr = require('listr');
const execa = require('execa');
const { getNextVersion } = require('../utils/versioning');
const { loadAdaptor } = require('../utils');
const { preflightTasks } = require('../tasks');

module.exports = async function releaseTask({
  adaptorPath,
  noBump,
  dryRun,
}) {
  const { name, version, repository } = loadAdaptor(adaptorPath);

  // await preflightTasks.run({ adaptorPath });
  // ask for version name
  //   allow 'existing' as an option
  //     don't blow up/don't commit/don't run `npm version`
  //
  //   run `npm version` with new version name
  //     try and undo when bump failed/couldn't push/tag
  //
  // try and run `npm publish --access=public`
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
    });

    await execa('sh', ['-c', `git push && git push --tags`], {
      cwd: adaptorPath,
    });
  }

  if (!noBump) {
    const bumpType = await getNextVersion(version);
    await bumpVersion({ adaptorPath, bumpType });
  }

  return await publish({ adaptorPath, dryRun });
};
