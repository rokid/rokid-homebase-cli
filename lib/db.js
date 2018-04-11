const low = require('lowdb')

const semver = require('semver')
const pkg = require('../package.json')
const config = require('./config')
const serialize = value => JSON.stringify(value, null, 2)
const db = process.env.NODE_ENV === 'test' ? low() : low(config.dbPath, {format: {serialize}})

db.defaults({
  sessions: [],
  devices: [],
  latestVersion: false,
  dbVersion: pkg.version
}).write()

if (semver.gt(pkg.version, db.get('dbVersion', pkg.version).value())) {
  db.set('devices', []).write()
  console.log(`数据文件 ${config.dbPath} 已更新`)
}

module.exports = db
