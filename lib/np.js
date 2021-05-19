const np = require('np/source');
const util = require('np/source/util');
const git = require('np/source/git-util');
const { isPackageNameAvailable } = require('np/source/npm/util');
const ui = require('np/source/ui');

module.exports = async function(adaptorPath, opts) {
      process.chdir(adaptorPath);
      const pkg = util.readPkg();

      const defaultflags = {
        cleanup: true,
        tests: true,
        publish: false,
        anyBranch: false,
        releaseDraft: true,
        publishScoped: true,
        yarn: false,
        '2fa': true,
      };

      const flags = {
        ...defaultflags,
        ...opts
      }


      const runPublish =
        !flags.releaseDraftOnly && flags.publish && !pkg.private;

      const availability = flags.publish
        ? await isPackageNameAvailable(pkg)
        : {
            isAvailable: false,
            isUnknown: false,
          };

      const branch = flags.branch || (await git.defaultBranch());
      const options = await ui(
        {
          ...flags,
          availability,
          version: false,
          runPublish,
          branch,
        },
        pkg
      );

      if (!options.confirm) {
        return false;
      }
      return np(options.version, options);
  
}
