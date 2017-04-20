const {table} = require('table');
const colors = require('colors');
const Session = require('../lib/session');

module.exports = function () {

  const session = new Session();

  if (session.allSessions.length === 0) {
    console.log('please add first');
    return;
  }

  let sessionsTable = [];
  sessionsTable.push(['name'.red, 'endpoint'.red, 'userId'.red, 'useToken'.red, 'in use'.red]);

  session.allSessions.forEach(s => {
    if (s.name === session.currentSessionName) {
      sessionsTable.push([s.name, s.endpoint, s.userAuth.userId, s.userAuth.userToken, '*****'])
    } else {
      sessionsTable.push([s.name, s.endpoint, s.userAuth.userId, s.userAuth.userToken, '']);
    }
  });

  console.log(table(sessionsTable));
};