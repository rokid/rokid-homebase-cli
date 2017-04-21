const should = require('chai').should();
const db = require('../lib/db');
const Session = require('../lib/session');
const session = new Session();

describe('session', function() {
  before(function() {
    const ses = {
      name: 'demo',
      endpoint: 'http://127.0.0.1:3000',
      useAuth:{
        userId: '',
        userToken: ''
      }
    };
    db.get('sessions')
      .push(ses)
      .write();

    db.set('currentSession', 'demo')
      .write();
  });

  describe('#session', function() {
    it('currentSessionName should be a string', function(done) {
      const currentSessionName = session.currentSessionName;
      currentSessionName.should.be.a('string');
      done();
    })
  })
});