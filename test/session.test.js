const assert = require('assert')
const db = require('../lib/db')
const Session = require('../lib/session')

describe('session', function () {
  before(function () {
    const ses = {
      name: 'demo',
      endpoint: 'http://127.0.0.1:3000',
      useAuth: {
        userId: '123',
        userToken: '123'
      }
    }
    db.get('sessions')
      .push(ses)
      .write()

    db.set('currentSession', 'demo')
      .write()
  })

  describe('#getAllSessions()', function () {
    it('allSessions should be an array', function (done) {
      assert(Array.isArray(Session.getAllSessions()))
      done()
    })
  })

  describe('#getCurrentSessionName()', function () {
    it('currentSessionName should be a string', function (done) {
      assert(typeof Session.getCurrentSessionName() === 'string')
      done()
    })
  })

  describe('#getCurrentSession()', function () {
    it('currentSession should be an object', function (done) {
      assert(Session.getCurrentSession() != null)
      done()
    })
  })

  describe('#setCurrentSession()', function () {
    it('currentSession should be updated', function (done) {
      Session.setCurrentSession('test')
      assert(db.get('currentSession').value() === 'test')
      done()
    })
  })

  describe('#getSessionByName()', function () {
    it('session get by name should be an object and name should be equal to input', function (done) {
      assert(Session.getSessionByName('demo') != null)
      assert(Session.getSessionByName('demo').name === 'demo')
      done()
    })
  })

  describe('#addSession()', function () {
    it('session should be added to sessions array', function (done) {
      const test = {
        name: 'test',
        endpoint: 'tcp://192.168.0.1:8080',
        userAuth: {
          userId: '12345',
          userToken: '12345'
        }
      }

      Session.addSession(test)
      assert(db.get('sessions').find({name: test.name}).value() != null)
      assert(db.get('sessions').find({name: test.name}).value().name === 'test')
      done()
    })
  })

  describe('#delSession()', function () {
    it('should not be found in sessions after delete', function (done) {
      Session.delSession('demo')
      assert(typeof db.get('sessions').find({name: 'demo'}).value() === 'undefined')
      done()
    })

    it('currentSessionName should be changed if deleting currentSession', function (done) {
      Session.delSession('demo')
      const currentSessionName = Session.getCurrentSessionName()
      assert(currentSessionName !== 'demo')
      assert(currentSessionName === 'test')
      done()
    })

    it('currentSessionName should be unset if deleting all sessions', function (done) {
      Session.delSession('demo')
      Session.delSession('test')
      const currentSessionName = Session.getCurrentSessionName()
      assert(typeof currentSessionName === 'undefined')
      done()
    })
  })
})
