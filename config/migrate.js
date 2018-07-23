const { existsSync, copyFileSync } = require('fs')
const { join } = require('path')

module.exports = function migrate (homePath, dbPath) {
  const originDbPath = join(homePath, 'rhome.json')
  if (originDbPath !== dbPath && !existsSync(dbPath) && existsSync(originDbPath)) {
    console.log()
    console.log(`Migrating config file from ${originDbPath} to ${dbPath}`)
    copyFileSync(originDbPath, dbPath)
    console.log('It\'s safe to remove old config file if you are not going to use rhome-v1 any more.')
    console.log()
  }
}
