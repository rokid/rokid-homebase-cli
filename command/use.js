const Session = require('../lib/session');

module.exports = function (name) {
  const session = new Session();
  const isExisted = session.getSessionByName(name);
  if (!isExisted) {
    console.log(`${name} is not added, please add first`);
  } else {
    session.setCurrentSession(name);
    console.log(`${name} is in use`);
  }
};