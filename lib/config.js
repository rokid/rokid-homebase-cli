const path = require('path');

const home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
exports.dbPath = path.join(home, 'rhome.json');
// exports.dbPath = path.join(process.cwd(), 'rhome.json'); //for debug