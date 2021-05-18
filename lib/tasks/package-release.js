const execa = require('execa');
const path = require('path');
const logSymbols = require('log-symbols');
const { loadAdaptor } = require('../utils');
const { uploadRelease } = require('./index');

// Task to remove the `package/...` structure that npm uses, we untar the
// pack file into a folder with the same name as the tarball and then re-tar it
async function rearrangeTarball({ src, dest, adaptorPath }) {
  try {
    await execa(
      'sh',
      [
        '-c',
        `
        mkdir -p ${dest} && \
        tar xzvf ${src}.tgz -C ${dest} --strip-components=1 && \
        tar czf ${dest}.tgz ${dest}
      `,
      ],
      { cwd: adaptorPath }
    );
  } finally {
    try {
      console.log(logSymbols.info, 'cleaning up');
      return execa('rm', ['-r', src + '.tgz', dest], {
        cwd: adaptorPath
      });
    } catch (e) {
      if (!e.message.match("Command failed")) {
        throw e;
      }
    }
  }
}

function pack({ adaptorPath }) {
  return execa('npm', ['pack'], { cwd: adaptorPath }).stdout.pipe(
    process.stdout
  );
}

module.exports = async function packageRelease({ adaptorPath, skipUpload, replaceExisting }) {
  const { name, version, repository } = loadAdaptor(adaptorPath);

  console.log(logSymbols.info, 'npm pack');
  await pack({ adaptorPath });

  const [scope, unscopedName] = name.replace('@', '').split('/');
  const packName = `${scope}-${unscopedName}-${version}`,
    rePackName = `${unscopedName}-v${version}`;

  console.log(logSymbols.info, 'rearranging tarball');
  await rearrangeTarball({ src: packName, dest: rePackName, adaptorPath });

  if (!skipUpload) {
    console.log(logSymbols.info, 'uploading release');
    await uploadRelease({
      owner: 'OpenFn',
      repo: repository.url.match(/\/([\w-]+).git$/)[1],
      tag: `v${version}`,
      tarballPath: path.join(adaptorPath, `${rePackName}.tgz`),
      replaceExisting
    }).run();
  }

  return true;
};
