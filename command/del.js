const Session = require('../lib/session');
const Device = require('../lib/device');

module.exports = function (name) {
  const session = new Session();
  const device = new Device();

  const sessions = session.allSessions;

  if (sessions.length === 0) {
    console.log('please add first');
    return;
  }

  if (!sessions.some(session => session.name === name)) {
    console.log('no such name, please try again');
    return;
  }

  session.delSessionByName(name);
  // if (device.allDevices.length !== 0) {}
  device.removeBySessionName(name);
};