const _ = require('lodash')
const db = require('./db')
const { updateState } = require('./transformation')

class Device {
  static getAllDevices () {
    return db.get('devices').value()
  }

  static getBySessionName (sessionName) {
    return db.get('devices').filter({
      sessionName: sessionName
    }).value()
  }

  static updateById (deviceId, sessionName, device) {
    db.get('devices')
      .find({
        deviceId: deviceId,
        sessionName: sessionName
      })
      .assign(Object.assign(device))
      .write()
  }

  static updateStateById (deviceId, sessionName, oldState, newState) {
    db.get('devices')
      .find({
        deviceId: deviceId,
        sessionName: sessionName
      })
      .assign({
        state: updateState(newState, oldState)
      })
      .write()
  }

  static updateOfSession (oldDevices, newDevices, sessionName) {
    newDevices
      .map(device => Object.assign({}, device, {
        sessionName: sessionName
      }))
      .map(device => {
        let currentDevice = _.find(oldDevices, {
          deviceId: device.deviceId,
          sessionName: sessionName
        })

        if (currentDevice) {
          return Object.assign({}, currentDevice, device, {
            state: updateState(currentDevice.state, device.state)
          })
        } else {
          Device.getAllDevices().push(device)
          return device
        }
      })

    let allDevices = Device.getAllDevices()
    allDevices = _.chain(allDevices)
      .map(device => {
        const newDevice = _.find(newDevices, {
          deviceId: device.deviceId,
          sessionName: sessionName
        })

        if (!newDevice) {
          return device
        } else {
          return newDevice
        }
      })

    db.set('devices', allDevices)
      .write()
  }

  static removeBySessionName (sessionName) {
    db.get('devices')
      .remove({
        sessionName: sessionName
      })
      .write()
  }
}

module.exports = Device
