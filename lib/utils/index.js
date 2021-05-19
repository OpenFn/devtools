const fs = require('fs');
const { getNextVersion } = require('./versioning');

function loadAdaptor(path) {
  return JSON.parse(fs.readFileSync(path + '/package.json'));
}


exports.loadAdaptor = loadAdaptor;
exports.getNextVersion = getNextVersion;
