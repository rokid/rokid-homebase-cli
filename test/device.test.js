const expect = require('chai').expect;
const db = require('../lib/db');
const Device = require('../lib/device');

describe('device', function() {
  before(function() {

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
      sessionName: 'demo'
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
      sessionName: 'demo'
    };

    const dev3 = {
      name: 'demo3',
      deviceId:'53a84e15-b855-4348-b4b4-f50795760b72',
      type: 'switch',
      state:{
        switch: 'on'
      },
      actions: {
        switch:['on', 'off']
      },
      sessionName: 'test'
    };

    db.get('devices')
      .push(dev1)
      .push(dev2)
      .push(dev3)
      .write();
  });

  describe('#getAllDevices()', function() {
    it('should be an array', function(done) {
      expect(Device.getAllDevices()).to.be.an('array');
      expect(Device.getAllDevices().length).to.equal(3);
      done();
    })
  });

  describe('#getBySessionName()', function() {
    it('should get all devices of target session', function(done) {
      const devs = Device.getBySessionName('demo');
      expect(devs).to.be.an('array');
      devs.forEach(dev => {
        expect(dev.sessionName).to.equal('demo');
      });
      done();
    })
  });

  describe('#updateStateById()', function() {
    it('state should be updated', function(done) {
      Device.updateStateById('fb02ea22-b0b7-4114-a911-8ce1b97ef3e5', 'demo', {switch:'on'}, {switch:'off'});
      const dev = db.get('devices')
        .filter({deviceId: 'fb02ea22-b0b7-4114-a911-8ce1b97ef3e5'})
        .value();
      expect(dev[0].state.switch).to.equal('off');
      done();
    })
  });

  describe('#updateOfSession()', function() {
    it('all devices of session should be updated', function(done) {
      const oldDevs = db.get("devices").value();
      const newDevs = oldDevs.map(dev => dev.state.switch = 'off');
      Device.updateOfSession(oldDevs, newDevs, 'demo');
      db
        .get('devices')
        .value()
        .forEach(dev => expect(dev.state.switch).to.equal('off'));
      done();
    })
  });

  describe('#removeBySessionName()', function() {
    it('all devices of session should be removed', function(done) {
      Device.removeBySessionName('test');
      const devs = db.get('devices').filter({sessionName: 'test'}).value();
      expect(devs.length).to.equal(0);
      done();
    })
  })
});