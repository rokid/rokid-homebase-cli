const path = require('path')

const home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME

module.exports = {
  dbPath: path.join(home, 'rhome.json')
}
