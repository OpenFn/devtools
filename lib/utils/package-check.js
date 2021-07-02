const execa = require('execa');
const path = require('path');

// Readies package.json for deploying to NPM

async function readyPackageJson(packageJson) {
  if (
    !Object.entries(packageJson.devDependencies).find(
      ([name, _version]) => name.toLowerCase() == '@openfn/simple-ast'
    )
  ) {
    throw new Error('@openfn/simple-ast not found in devDependencies.');
  }

  if (!packageJson.name.match(/^@openfn\//)) {
    packageJson.name = `@openfn/${packageJson.name}`;
  }

  if (!packageJson.directories) {
    packageJson.directories = { lib: './lib' };
  }

  if (!packageJson.repository) {
    const shortName = packageJson.name.split("/")[1]
    packageJson.repository = { type: 'git', url: `https://github.com/openfn/${shortName}.git` };
  }

  if (!packageJson.files) {
    packageJson.files = ['lib/', 'ast.json'];
  }

  if (!packageJson.files.includes('ast.json')) {
    packageJson.files.push('ast.json');
  }

  packageJson.scripts = addScripts(packageJson.scripts);

  // TODO: Refactor changes into separate functions and pass in cwd to determine
  //       origin.
  // if (!packageJson.repository) {
  //   const origin = (
  //     await execa.stdout(['git', ['remote', 'get-url', 'origin']], {
  //       cwd: path.dirname(path),
  //     })
  //   ).trim();

  //   packageJson.repository = {
  //     type: 'git',
  //     url: `git+https://github.com/OpenFn/${
  //       origin.match(/OpenFn\/([\w-]+).git$/)[0]
  //     }.git`,
  //   };
  // }

  packageJson.bundledDependencies = Object.keys(packageJson.dependencies);

  return packageJson;
}

// Given the `scripts` object from a package.json, remove any existing `prepack`
// as it's been replaced by build and version hooks.
// And then add the correct/current ast, build, postversion and version hooks.
function addScripts(existingScripts) {
  return {
    ...Object.fromEntries(
      Object.entries(existingScripts).filter(
        ([k, _v]) => !['prepack'].includes(k)
      )
    ),
    ast: 'simple-ast --adaptor ./src/Adaptor.js --output ast.json',
    build: "node_modules/.bin/babel src -d lib && npm run ast",
    postversion: "git push && git push --tags",
    version: "npm run build && git add -A lib ast.json"
  };
}

exports.readyPackageJson = readyPackageJson;
