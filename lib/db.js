const low = require('lowdb');
const config = require('../lib/config');
const serialize = value => JSON.stringify(value, null, 2);
const db = process.env.NODE_ENV==='test' ? low() : low(config.dbPath, {format: {serialize}});

db.defaults({
  sessions: [],
  devices: []
})
  .write();

module.exports = db;
