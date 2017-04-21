const db = require('./db');
const url = require('url');
const http = require('./protocol/http');
const tcp = require('./protocol/tcp');

function Session() {}

Session.prototype.request = function(method, data) {
  const endpoint = Session.getCurrentSession().endpoint;
  const URL = url.parse(endpoint);
  switch(URL.protocol){
    case 'http:':
      return http(endpoint, method, data);
    case 'tcp:':
      return tcp(URL.hostname, URL.port, method, data);
  }
};

Session.getAllSessions = function () {
  return db.get('sessions').value()
};

Session.getCurrentSessionName = function () {
  return db.get('currentSession').value();
};

Session.getCurrentSession = function () {
  return db.get('sessions').
    find({name: Session.getCurrentSessionName()})
    .value()
};

Session.setCurrentSession = function (name) {
  db.set('currentSession', name)
    .write();
};

Session.getSessionByName = function (name) {
  return db.get('sessions').find({name: name}).value();
};

Session.addSession = function (session) {
  db.get('sessions')
    .push(session)
    .write();
};

Session.delSession = function (name) {
  db.get('sessions')
    .remove({name: name})
    .write();

  if (Session.getCurrentSessionName() === name) {
    if (Session.getAllSessions().length === 0) {
      db.unset('currentSession')
        .write();
    } else {
      Session.setCurrentSession(Session.getAllSessions()[0].name)
    }
  }
};

module.exports = Session;

