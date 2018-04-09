const low = require('lowdb')
const config = require('./config')
const serialize = value => JSON.stringify(value, null, 2)
const db = process.env.NODE_ENV === 'test' ? low() : low(config.dbPath, {format: {serialize}})

db.defaults({
  sessions: [],
  devices: [],
  latestVersion: false
}).write()

module.exports = db
