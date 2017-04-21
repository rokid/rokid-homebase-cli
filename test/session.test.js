const should = require('chai').should();
const db = require('../lib/db');
const Session = require('../lib/session');

describe('session', function() {
  beforeEach(function() {
    const ses = {
      name: 'demo',
      endpoint: 'http://127.0.0.1:3000',
      useAuth:{
        userId: '123',
        userToken: '123'
      }
    };
    db.get('sessions')
      .push(ses)
      .write();

    db.set('currentSession', 'demo')
      .write();
  });

  describe('#getAllSessions()', function() {
    it('allSessions should be an array', function(done) {
      Session.getAllSessions().should.be.an('array');
      done();
    })
  });

  describe('#getCurrentSessionName()', function() {
    it('currentSessionName should be a string', function(done) {
      Session.getCurrentSessionName().should.be.a('string');
      done();
    })
  });

  describe('#getCurrentSession()', function() {
    it('currentSession should be an object', function(done) {
      Session.getCurrentSession().should.be.a('object');
      done();
    })
  });

  describe('#setCurrentSession()', function() {
    it('currentSession should be updated', function(done) {
      Session.setCurrentSession('test');
      db.get('currentSession').value().should.equal('test');
      done();
    })
  });

  describe('#getSessionByName()', function() {
    it('session get by name should be an object and name should be equal to input', function(done) {
      Session.getSessionByName('demo').should.be.an('object');
      Session.getSessionByName('demo').name.should.equal('demo');
      done();
    })
  });

  describe('#addSession()', function() {
    it('session should be added to sessions array', function(done) {
      const test = {
        name: 'test',
        endpoint: 'tcp://192.168.0.1:8080',
        userAuth:{
          userId: '12345',
          userToken: '12345'
        }
      };

      Session.addSession(test);
      db.get('sessions').find({name: test.name}).value().should.be.an('object');
      db.get('sessions').find({name: test.name}).value().name.should.equal('test');
      done();
    })
  })
});