const Listr = require('listr');
const execa = require('execa');
const path = require('path');
const { loadAdaptor } = require('../utils');
const { uploadRelease } = require('./index');

module.exports = function packageRelease({ adaptorPath, uploadToGithub }) {
  const { name, version, repository } = loadAdaptor(adaptorPath);

  const packTask = {
    title: 'npm pack',
    task: () => {
      return execa('npm', ['pack'], { cwd: adaptorPath });
    },
  };

  const [scope, unscopedName] = name.replace('@', '').split('/');
  const packName = `${scope}-${unscopedName}-${version}`,
    rePackName = `${unscopedName}-v${version}`;

  // Task to remove the `package/...` structure that npm uses, we untar the
  // pack file into a folder with the same name as the tarball and then re-tar it
  const rearrangeTask = {
    title: 'rearrange tarball for Github',
    task: async () => {
      try {
        await execa(
          'sh',
          [
            '-c',
            `
        mkdir -p ${rePackName} && \
        tar xzvf ${packName}.tgz -C ${rePackName} --strip-components=1 && \
        tar czf ${rePackName}.tgz ${rePackName}
      `,
          ],
          { cwd: adaptorPath }
        );
      } finally {
        try {
          await execa('rm', ['-r', packName + '.tgz', rePackName], {
            cwd: adaptorPath,
          });
        } catch (error) {
          console.error(error);
        }
      }
    },
  };

  const uploadTask = {
    title: 'Upload build to Github',
    task: () =>
      uploadRelease({
        owner: 'OpenFn',
        repo: repository.url.match(/\/([\w-]+).git$/)[1],
        tag: `v${version}`,
        tarballPath: path.join(adaptorPath, `${rePackName}.tgz`),
      }).run(),
    enabled: () => uploadToGithub,
  };

  return new Listr([packTask, rearrangeTask, uploadTask]);
};
