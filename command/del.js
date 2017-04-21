const Session = require('../lib/session');
const Device = require('../lib/device');

module.exports = function (name) {

  const sessions = Session.getAllSessions();

  if (sessions.length === 0) {
    console.log('please add first');
    return;
  }

  if (!sessions.some(session => session.name === name)) {
    console.log('no such name, please try again');
    return;
  }

  Session.delSession(name);
  Device.removeBySessionName(name);
};