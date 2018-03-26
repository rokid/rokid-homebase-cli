const expect = require('chai').expect
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
      expect(Session.getAllSessions()).to.be.an('array')
      done()
    })
  })

  describe('#getCurrentSessionName()', function () {
    it('currentSessionName should be a string', function (done) {
      expect(Session.getCurrentSessionName()).to.be.a('string')
      done()
    })
  })

  describe('#getCurrentSession()', function () {
    it('currentSession should be an object', function (done) {
      expect(Session.getCurrentSession()).to.be.a('object')
      done()
    })
  })

  describe('#setCurrentSession()', function () {
    it('currentSession should be updated', function (done) {
      Session.setCurrentSession('test')
      expect(db.get('currentSession').value()).to.equal('test')
      done()
    })
  })

  describe('#getSessionByName()', function () {
    it('session get by name should be an object and name should be equal to input', function (done) {
      expect(Session.getSessionByName('demo')).to.be.an('object')
      expect(Session.getSessionByName('demo').name).to.equal('demo')
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
      expect(db.get('sessions').find({name: test.name}).value()).to.be.an('object')
      expect(db.get('sessions').find({name: test.name}).value().name).to.equal('test')
      done()
    })
  })

  describe('#delSession()', function () {
    it('should not be found in sessions after delete', function (done) {
      Session.delSession('demo')
      expect(typeof db.get('sessions').find({name: 'demo'}).value()).to.equal('undefined')
      done()
    })

    it('currentSessionName should be changed if deleting currentSession', function (done) {
      Session.delSession('demo')
      const currentSessionName = Session.getCurrentSessionName()
      expect(currentSessionName).to.not.equal('demo')
      expect(currentSessionName).to.equal('test')
      done()
    })

    it('currentSessionName should be unset if deleting all sessions', function (done) {
      Session.delSession('demo')
      Session.delSession('test')
      const currentSessionName = Session.getCurrentSessionName()
      expect(typeof currentSessionName).to.equal('undefined')
      done()
    })
  })
})
