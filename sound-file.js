var fs = require('fs');
var path = require('path');

// Resolve a sound name sent by a client to the full path of a .wav file in
// dataDir. Returns null for anything else: other folders, other file types,
// files that do not exist, or values that are not strings.
function resolveSoundFile(dataDir, name) {
    if (typeof name !== 'string' || name !== path.basename(name)) {
        return null;
    }
    if (path.extname(name).toLowerCase() !== '.wav') {
        return null;
    }

    var fullPath = path.join(dataDir, name);
    try {
        return fs.statSync(fullPath).isFile() ? fullPath : null;
    } catch (e) {
        return null;
    }
}

module.exports = resolveSoundFile;
