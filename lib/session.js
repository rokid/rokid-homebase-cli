const db = require('./db');

function Session() {
  const self = this;
  this.currentSessionName = db.get('currentSession').value();
  this.sessions = db.get('sessions');
  this.allSessions = this.sessions.value();
  this.currentSession = this.sessions.find({name: self.currentSessionName}).value();
}

Session.prototype.setCurrentSession = function (name) {
  db.set('currentSession', name)
    .write();
};

Session.prototype.getSessionByName = function (name) {
  return this.sessions.find({name: name}).value();
};

Session.prototype.addSession = function (session) {
  this.sessions
    .push(session)
    .write();
};

Session.prototype.delSessionByName = function (name) {
  const self = this;
  this.sessions
    .remove({name: name})
    .write();

  if (this.currentSessionName === name) {
    if (this.allSessions.length === 0) {
      db.unset('currentSession')
        .write();
    } else {
      this.setCurrentSession(self.allSessions[0].name)
    }
  }
};

module.exports = Session;