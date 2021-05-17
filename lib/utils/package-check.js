const execa = require('execa');
const path = require('path');

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

  packageJson.scripts.prepack = 'npm run ast';

  packageJson.scripts.build = 'make && npm run ast';

  packageJson.scripts.ast =
    'simple-ast --adaptor ./src/Adaptor.js --output ast.json';

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
    devDependencies,
    dependencies,
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
  } else {
    const depKeys = Object.keys(dependencies);

    if (depKeys.sort().join() !== bundledDependencies.sort().join()) {
      errors.push(
        new Error(
          "'bundledDependencies' is out of order or doesn't contain all dependencies."
        )
      );
    }
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

  if (files && !files.includes('ast.json')) {
    errors.push(
      new Error("No 'ast.json' entry found in package.json 'files' field.")
    );
  }

  if (!scripts.prepack) {
    errors.push(
      new Error("No 'prepack' item found in package.json 'scripts' field")
    );
  }

  if (!Object.entries(devDependencies).find(
    ([name, _version]) => name.toLowerCase() == '@openfn/simple-ast'
  )) {
    errors.push(
      new Error("simple-ast not found in devDependencies.")
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
exports.readyPackageJson = readyPackageJson;
exports.validatePackageJson = validatePackageJson;
