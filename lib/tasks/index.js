const GitHubApi = require('@octokit/rest').Octokit;
const Listr = require('listr');
const fs = require('fs');
const execa = require('execa');

const { loadAdaptor } = require('../utils');

function checkGithubToken(context) {
  if (!(token = process.env['GH_TOKEN'])) {
    throw new Error(
      'Github OAuth token not found, please set via GH_TOKEN=...'
    );
  }

  context.github = new GitHubApi({ auth: token });
}
exports.checkGithubToken = checkGithubToken;

async function checkNpmLogin({ adaptorPath }) {
  await execa('sh', ['-c', 'npm whoami'], {
    cwd: adaptorPath,
  }).catch(() => {
    throw new Error("Couldn't validate NPM login status.");
  });
}
exports.checkNpmLogin = checkNpmLogin;

function handleExistingRelease({
  owner,
  github,
  repo,
  existing,
  tarballStat,
  replaceExisting,
}) {
  return new Listr([
    {
      title: 'Comparing existing',
      task: () => {
        if (tarballStat.size == existing.size) {
          throw new Error('Build already uploaded (and has the same filesize)');
        } else {
          if (!replaceExisting) {
            throw new Error(
              'Build exists but is a different size. Use --replace option to update existing release files.'
            );
          }
        }
      },
    },
    {
      title: 'Delete existing release file',
      task: () => {
        return github.repos.deleteReleaseAsset({
          owner,
          repo,
          asset_id: existing.id,
        });
      },
      enabled: () => replaceExisting,
    },
  ]);
}

const uploadRelease = function ({
  adaptorPath,
  tarballPath,
  owner,
  repo,
  tag,
  replaceExisting,
}) {
  if (!tarballPath) {
    throw new Error(`tarballPath not provided to task`);
  }

  return new Listr(
    [
      {
        title: 'Stat build tarball',
        task: ctx => {
          return new Promise((resolve, reject) => {
            fs.stat(tarballPath, (err, stats) => {
              if (err) {
                reject(err);
                reject(new Error(`Can't access ${tarballPath}`));
              } else {
                ctx.tarballStat = stats;
                resolve();
              }
            });
          });
        },
      },
      {
        title: 'Check for Github token',
        task: checkGithubToken,
      },
      {
        title: 'Check for existing release',
        task: context => {
          const { tarballStat, github } = context;

          return github.repos
            .getReleaseByTag({ owner, repo, tag })
            .catch(async e => {
              if (e.code == 404) {
                const previousTag = (
                  await execa(
                    'sh',
                    ['-c', `git describe --abbrev=0 --always --tags ${tag}^`],
                    {
                      cwd: adaptorPath,
                    }
                  )
                ).stdout;

                const body = (
                  await execa(
                    'sh',
                    [
                      '-c',
                      `git log ${previousTag}..${tag} --pretty=format:"%h %s"`,
                    ],
                    { cwd: adaptorPath }
                  )
                ).stdout;

                return github.repos.createRelease({
                  owner,
                  repo,
                  tag_name: tag,
                  body,
                });
              }
              return Promise.reject(e);
            })
            .then(release => {
              context.release = release;

              const existing = release.data.assets.filter(
                a => a.name == 'build.tgz'
              )[0];

              if (existing) {
                return handleExistingRelease({
                  owner,
                  github,
                  repo,
                  existing,
                  tarballStat,
                  replaceExisting,
                });
              }

              return 'No existing release build found.';
            });
        },
      },
      {
        title: 'Uploading release',
        task: ({ github, release }) => {
          return github.repos
            .uploadReleaseAsset({
              owner,
              repo,
              name: 'build.tgz',
              release_id: release.data.id,
              data: fs.readFileSync(tarballPath),
            })
            .then(response => {
              return `✓ Build uploaded as release asset: ${response.data.browser_download_url}`;
            });
        },
      },
    ],
    { collapse: false }
  );
};
exports.uploadRelease = uploadRelease;

const { validatePackageJson } = require('../utils/package-check');
const simpleGit = require('simple-git');

const preflightTasks = new Listr([
  {
    title: 'Pre-flight checks',
    task: () => {
      return new Listr(
        [
          {
            title: 'Checking package.json',
            task: ({ adaptorPath }) =>
              validatePackageJson(loadAdaptor(adaptorPath)),
          },
          {
            title: 'Check for GH_TOKEN',
            task: checkGithubToken,
          },
          {
            title: 'Logged into NPM',
            task: checkNpmLogin,
          },
          {
            title: 'Fetching from origin',
            task: async ({ adaptorPath }) => {
              const git = simpleGit(adaptorPath);
              const isRepo = await git.checkIsRepo();

              if (!isRepo) {
                throw new Error('Path is not a git repo.');
              }

              await git.fetch();
              // execa
              //   .stdout('git', ['fetch', 'origin'], { cwd: adaptorPath })
              //   .then(result => {
              //     if (result !== '') {
              //       throw new Error('Failed performing `git fetch origin`');
              //     }
              //   }),
            },
          },
        ],
        { concurrent: false }
      );
    },
  },
]);

exports.preflightTasks = preflightTasks;
