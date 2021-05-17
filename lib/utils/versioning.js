const semver = require('semver');

const inquirer = require('inquirer');

async function getNextVersion(currentVersion) {
  const versionChoices = [
    'patch',
    'minor',
    'major',
    'prerelease',
    'prepatch',
    'preminor',
    'premajor',
  ].map(inc => {
    const next = semver.inc(currentVersion, inc);
    return { name: `${inc.padEnd(15)}${next}`, value: inc };
  });

  return await inquirer
    .prompt([
      {
        type: 'list',
        name: 'version',
        message: 'What kind of change is this?',
        choices: versionChoices,
      },
    ])
    .then(({ version }) => version);
}

exports.getNextVersion = getNextVersion;