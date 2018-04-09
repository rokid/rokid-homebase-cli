const _ = require('lodash')
const assert = require('assert')
const db = require('../lib/db')
const Device = require('../lib/device')

describe('device', function () {
  beforeEach(function () {
    const dev1 = {
      displayName: 'demo1',
      endpointId: 'fb02ea22-b0b7-4114-a911-8ce1b97ef3e5',
      displayType: 'light',
      state: [{
        interface: 'switch',
        value: 'on'
      }],
      capabilities: [{
        interface: 'switch',
        supportedOperations: ['on', 'off']
      }],
      sessionName: 'demo'
    }

    const dev2 = {
      displayName: 'demo2',
      endpointId: '934ab762-4136-4985-bc69-5c8a69cd7092',
      displayType: 'switch',
      state: [{
        interface: 'switch',
        value: 'on'
      }],
      capabilities: [{
        interface: 'switch',
        supportedOperations: ['on', 'off']
      }],
      sessionName: 'demo'
    }

    const dev3 = {
      displayName: 'demo3',
      endpointId: '53a84e15-b855-4348-b4b4-f50795760b72',
      displayType: 'switch',
      state: [{
        interface: 'switch',
        value: 'on'
      }],
      capabilities: [{
        interface: 'switch',
        supportedOperations: ['on', 'off']
      }],
      sessionName: 'test'
    }

    db.set('devices', [dev1, dev2, dev3])
      .write()
  })

  describe('#getAllDevices()', function () {
    it('should be an array', function (done) {
      assert(Array.isArray(Device.getAllDevices()))
      assert(Device.getAllDevices().length === 3)
      done()
    })
  })

  describe('#getBySessionName()', function () {
    it('should get all devices of target session', function (done) {
      const devs = Device.getBySessionName('demo')
      assert(Array.isArray(devs))
      devs.forEach(dev => {
        assert(dev.sessionName === 'demo')
      })
      done()
    })
  })

  describe('#updateStateById()', function () {
    it('state should be updated', function (done) {
      Device.updateStateById('fb02ea22-b0b7-4114-a911-8ce1b97ef3e5', 'demo',
        [{interface: 'switch', value: 'on'}],
        [{interface: 'switch', value: 'off'}]
      )
      const dev = db.get('devices')
        .find({endpointId: 'fb02ea22-b0b7-4114-a911-8ce1b97ef3e5'})
        .value()
      assert(_.find(dev.state, { interface: 'switch' }).value === 'off')
      done()
    })
  })

  describe('#updateOfSession()', function () {
    it('all devices of session should be updated', function (done) {
      const oldDevs = db.get('devices').value()
      const newDevs = oldDevs.map(dev => {
        _.find(dev.state, { interface: 'switch' }).value = 'off'
        return dev
      })
      Device.updateOfSession(oldDevs, newDevs, 'demo')
      db
        .get('devices')
        .value()
        .forEach(dev => assert(_.find(dev.state, { interface: 'switch' }).value === 'off'))
      done()
    })
  })

  describe('#removeBySessionName()', function () {
    it('all devices of session should be removed', function (done) {
      Device.removeBySessionName('test')
      const devs = db.get('devices').filter({sessionName: 'test'}).value()
      assert(devs.length === 0)
      done()
    })
  })
})
