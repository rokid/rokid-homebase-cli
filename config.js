const path = require('path');

const home = process.platform === 'darwin' ? process.env.HOME : process.env.HOMEPATH;
exports.dbPath = path.join(home, 'rhome.json');