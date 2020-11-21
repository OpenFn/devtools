# Extra tools for adaptors

## Scripts

In order to run the scripts, ensure you have cd'd into the project directory
and enter `./scripts/<script-name>`

### bootstrap

Installs packages and prepares the working directory. This needs to be run
before running any of the other scripts.

### generate-doclets

Iterates overs all language pack folder names found in the `repos` list and
creates a doclet json file in the `doclets` directory.

### analyse-doclets

Iterates overs all doclets found in `doclets` and gives a tree view
of the doclet structure using [jsdoc-query](https://github.com/OpenFn/jsdoc-query).

### bundle

Creates a tarball with all production dependencies install for a given module.

Example: `./scripts/bundle-node language-common -o builds`
creates a `language-common-v1.0.0.tgz` file in the 'builds' directory.

Arguments `./scripts/bundle-node <language> -o <output folder> -d`

- `-o` - Output folder
- `-d` - Debug

### bundle-all

Runs `bundle` for all repos found in the list, and outputs them to the
`builds` folder.

### upload-release

Uploads a tarball to a Github release.

Example:

```
GH_TOKEN=<oauth-token> \
  ./scripts/upload-release -i ./builds/language-common-v0.0.0.tgz
```

Infers the repo name and version number from the file.

Arguments `./scripts/upload-release -i <file> [-u]`

- `i` - Path to build file to upload
- `u` - Update a file if already exists (and is a different size)

## A repos file for quick setup

Located in the root of the project, this file is a list of language pack
git repo names used by the scripts in order to check out the packages
from Github.

## Releasing a new adaptor version

1. **Bump the version in `package.json`**

2. **Commit**
   Ensure there is a tag for the version. (`git tag`)
   _This is handled with a git hook provided by `bootstrap`_

3. **Push the commits and tag to GitHub**
   `git push && git push --tags`

4. **Create a release**
   Go to the associated repo on Github, click 'Releases' and then
   'Draft a new release'.
   Select the version tag that was pushed in the last step.
   Write a title and release notes as needed.

   Click 'Publish release'.

5. **Return to the language-packages directory**
   `cd ../` to return to the language-packages directory.

6. **Bundle the module**
   `./scripts/bundle-node <language-pack> -o builds` or `./scripts/bundle-java <language-pack> -o builds`

   Verify that there is a file in `builds` with the naming convention of:
   `<language-pack>-<version>.tgz`

7. **Upload the build**
   Using the `upload-release` script:

   `./scripts/upload-release -i builds/<file>`

   If the wrong file was uploaded or you want to replace the build on Github
   then use the `-u` flag which deletes the build from Github if the filesize
   is different.

   This script expects a `GH_TOKEN` env variable, which is an OAuth2 token you
   must get from Github (via the account page)

## Using a new adaptor in an OpenFn/platform instance

1. Add your release to the `scripts/install-lp` script.
2. Add the version number to `priv/adaptors.json`.
3. Add the `bodySchema` to `CredentialView.js`.
