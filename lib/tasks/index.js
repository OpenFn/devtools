const GitHubApi = require('@octokit/rest').Octokit;
const Listr = require('listr');
const fs = require('fs');

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

function handleExistingRelease({
  github,
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
            .then(release => {
              context.release = release;

              const existing = release.data.assets.filter(
                a => a.name == 'build.tgz'
              )[0];

              if (existing) {
                return handleExistingRelease({
                  github,
                  existing,
                  tarballStat,
                  replaceExisting,
                });
              }

              return 'No existing release build found.';
            })
            .catch(e => {
              if (e.code == 404) {
                return Promise.reject(
                  new Error(`${tag} does not exist for repo: ${repo}`)
                );
              }
              return Promise.reject(e);
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

const { validatePackageJson } = require('../utils');

exports.checkPackageJson = function checkPackageJson(adaptorPath) {
  validatePackageJson(loadAdaptor(adaptorPath));
};
