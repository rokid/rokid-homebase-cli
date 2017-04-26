const expect = require('chai').expect;
const db = require('../lib/db');
const del = require('../command/del');

describe('del', function() {
  before(function() {
    const ses = {
      name: 'test-del',
      endpoint: 'http://127.0.0.1:3000',
      useAuth:{
        userId: '123',
        userToken: '123'
      }
    };
    db.get('sessions')
      .push(ses)
      .write();

    db.set('currentSession', 'test-del')
      .write();

    const dev1 = {
      name: 'demo1',
      deviceId:'fb02ea22-b0b7-4114-a911-8ce1b97ef3e5',
      type: 'light',
      state:{
        switch: 'on'
      },
      actions: {
        switch:['on', 'off']
      },
      sessionName: 'test-del'
    };

    const dev2 = {
      name: 'demo2',
      deviceId:'934ab762-4136-4985-bc69-5c8a69cd7092',
      type: 'switch',
      state:{
        switch: 'on'
      },
      actions: {
        switch:['on', 'off']
      },
      sessionName: 'test-del'
    };

    db.get('devices')
      .push(dev1)
      .push(dev2)
      .write();
  });

  it('session should be deleted', function(done) {
    del('test-del');
    const session = db.get('sessions').find({sessionName: 'test-del'}).value();
    expect(typeof session).to.equal('undefined');
    done();
  });

  it('currentSessionName should be changed', function(done) {
    const currentSessionName = db.get('currentSession').value();
    expect(currentSessionName).to.not.equal('test-del');
    done();
  })
});