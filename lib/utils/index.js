const fs = require('fs');
const execa = require('execa');
const path = require('path');

function loadAdaptor(path) {
  return JSON.parse(fs.readFileSync(path + '/package.json'));
}

// Readies package.json for deploying to NPM
async function readyPackageJson(packageJson) {
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

  packageJson.scripts.prepack =
    'npx @openfn/simple-ast --adaptor ./lib/Adaptor.js --output ast.json';

  if (!packageJson.repository) {
    const origin = (
      await execa.stdout(['git', ['remote', 'get-url', 'origin']], {
        cwd: path.dirname(path),
      })
    ).trim();

    packageJson.repository = {
      type: 'git',
      url: `git+https://github.com/OpenFn/${
        origin.match(/OpenFn\/([\w-]+).git$/)[0]
      }.git`,
    };
  }

  packageJson.bundledDependencies = Object.keys(packageJson.dependencies);

  return packageJson;
}

function checkPackageJson(packageJson) {
  const {
    name,
    bundledDependencies,
    scripts,
    directories,
    files,
    repository,
  } = packageJson;

  let errors = [];

  if (!name.match(/^@openfn\//)) {
    errors.push(
      new Error('Name field in package.json not prependend with @openfn')
    );
  }

  if (!bundledDependencies) {
    errors.push(new Error("No 'bundledDependencies' found in package.json"));
  }

  if (!repository) {
    errors.push(new Error("No 'repository' field found in package.json"));
  }

  if (!directories) {
    errors.push(new Error("No 'directories' field found in package.json"));
  }

  if (!files) {
    errors.push(new Error("No 'files' field found in package.json"));
  }

  if (!files.includes('ast.json')) {
    errors.push(
      new Error("No 'ast.json' entry found in package.json 'files' field.")
    );
  }

  if (!scripts.prepack) {
    errors.push(
      new Error("No 'prepack' item found in package.json 'scripts' field")
    );
  }

  return errors;
}

function validatePackageJson(packageJson) {
  const errors = checkPackageJson(packageJson);

  if (errors[0]) {
    throw errors[0];
  }
}

exports.checkPackageJson = checkPackageJson;
exports.loadAdaptor = loadAdaptor;
exports.readyPackageJson = readyPackageJson;
exports.validatePackageJson = validatePackageJson;
