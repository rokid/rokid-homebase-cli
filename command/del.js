const debug = require('debug');
const low = require('lowdb');
const config = require('../lib/config');
const serialize = value => JSON.stringify(value, null, 2);
const db = low(config.dbPath, {format: {serialize}});

module.exports = function (name) {

  const sessions = db.get('sessions').value();

  if (sessions.length === 0) {
    console.log('please add first');
    return;
  }

  if (!sessions.some(session => session.name === name)) {
    console.log('no such name, please try again');
    return;
  }

  db.get('sessions')
    .remove({name: name})
    .write();

  if (db.get('currentSession').value() === name) {
    if (sessions.length === 0) {
      db.unset('currentSession')
        .write();
    } else {
      db.set('currentSession', sessions[0].name)
        .write();
    }
  }

  const devices = db.get('devices');
  if (devices.value().length !== 0) {
    devices
      .remove({sessionName: name})
      .write();
  }
};