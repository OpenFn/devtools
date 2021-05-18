const execa = require('execa');
const path = require('path');

// Readies package.json for deploying to NPM

async function readyPackageJson(packageJson) {
  if (!Object.entries(packageJson.devDependencies).find(
    ([name, _version]) => name.toLowerCase() == '@openfn/simple-ast'
  )) {
    throw new Error("@openfn/simple-ast not found in devDependencies.")
  }

  if (!packageJson.name.match(/^@openfn\//)) {
    packageJson.name = `@openfn/${packageJson.name}`;
  }

  if (!packageJson.directories) {
    packageJson.directories = { lib: './lib' };
  }

  if (!packageJson.files) {
    packageJson.files = ['lib/', 'ast.json'];
  }

  if (!packageJson.files.includes('ast.json')) {
    packageJson.files.push('ast.json');
  }

  packageJson.scripts.prepack = 'npm run ast';

  packageJson.scripts.build = 'make && npm run ast';

  packageJson.scripts.ast =
    'simple-ast --adaptor ./src/Adaptor.js --output ast.json';

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

exports.readyPackageJson = readyPackageJson;
