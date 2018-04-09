const { URL } = require('url')
const db = require('./db')
const http = require('./carrier/http')
const ProtocolV1 = require('./protocol/v1')
const ProtocolV2 = require('./protocol/v2')
const tcp = require('./carrier/tcp')

class Session {
  static getAllSessions () {
    return db.get('sessions').value()
  }

  static getCurrentSessionName () {
    return db.get('currentSession').value()
  }

  static getCurrentSession () {
    return db.get('sessions')
      .find({
        name: Session.getCurrentSessionName()
      })
      .value()
  }

  static setCurrentSession (name) {
    db.set('currentSession', name)
      .write()
  }

  static getSessionByName (name) {
    return db.get('sessions').find({
      name: name
    }).value()
  }

  static addSession (session) {
    db.get('sessions')
      .push(session)
      .write()
  }

  static delSession (name) {
    db.get('sessions')
      .remove({
        name: name
      })
      .write()

    if (Session.getCurrentSessionName() === name) {
      if (Session.getAllSessions().length === 0) {
        db.unset('currentSession')
          .write()
      } else {
        Session.setCurrentSession(Session.getAllSessions()[0].name)
      }
    }
  }

  request (method, ...args) {
    const { endpoint, protocol, userAuth } = Session.getCurrentSession()
    let Protocol
    switch (protocol) {
      case 'v2':
        Protocol = ProtocolV2
        break
      default:
        Protocol = ProtocolV1
    }
    const url = new URL(endpoint)
    switch (url.protocol) {
      case 'https:':
      case 'http:': {
        const protocol = new Protocol(http, url, userAuth)
        return protocol[method].apply(protocol, args)
      }
      case 'tcp:':
        return tcp(URL.hostname, URL.port, method, ...args)
      default:
    }
  }
}

module.exports = Session
