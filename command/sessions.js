const low = require('lowdb');
const config = require('../lib/config');
const {table} = require('table');
const colors = require('colors');
const serialize = value => JSON.stringify(value, null, 2);
const db = low(config.dbPath, {format: {serialize}});

module.exports = function () {

  const sessions = db.get('sessions').value();
  const currentSession = db.get('currentSession').value();

  if (sessions.length === 0) {
    console.log('please add first');
    return;
  }

  let sessionsTable = [];
  sessionsTable.push(['name'.red, 'endpoint'.red, 'userId'.red, 'useToken'.red, 'in use'.red]);

  sessions.forEach(session => {
    if (session.name === currentSession) {
      sessionsTable.push([session.name, session.endpoint, session.userAuth.userId, session.userAuth.userToken, '*****'])
    } else {
      sessionsTable.push([session.name, session.endpoint, session.userAuth.userId, session.userAuth.userToken, '']);
    }
  });

  console.log(table(sessionsTable));
};