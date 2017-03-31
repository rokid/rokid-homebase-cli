const path = require('path');

const home = process.platform === 'darwin' ? process.env.HOME : process.env.HOMEPATH;
// exports.dbPath = path.join(home, 'rhome.json');
exports.dbPath = path.join(process.cwd(), 'rhome.json'); //for debug