const path = require('path')
const migrate = require('./migrate')

const home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
const dbPath = path.join(home, '.rhome.json')

migrate(home, dbPath)

module.exports = {
  dbPath
}
