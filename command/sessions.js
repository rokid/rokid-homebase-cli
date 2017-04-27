const {table} = require('table');
const colors = require('colors');
const Session = require('../lib/session');

module.exports = function () {

  if (Session.getAllSessions().length === 0) {
    console.log('please add first');
    return;
  }

  let sessionsTable = [];
  sessionsTable.push(['name'.red, 'endpoint'.red, 'userId'.red, 'useToken'.red, 'in use'.red]);

  Session.getAllSessions().forEach(s => {
    if (s.name === Session.getCurrentSessionName()) {
      sessionsTable.push([s.name, s.endpoint, s.userAuth.userId.slice(0, 8), s.userAuth.userToken.slice(0, 10), '*****'])
    } else {
      sessionsTable.push([s.name, s.endpoint, s.userAuth.userId.slice(0, 8), s.userAuth.userToken.slice(0, 10), '']);
    }
  });

  console.log(table(sessionsTable));
};