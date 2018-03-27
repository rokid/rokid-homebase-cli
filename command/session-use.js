const Session = require('../lib/session')

module.exports = function (name) {
  const isExisted = Session.getSessionByName(name)
  if (!isExisted) {
    console.log(`${name} is not added, please add first`)
  } else {
    Session.setCurrentSession(name)
    console.log(`${name} is in use`)
  }
}
