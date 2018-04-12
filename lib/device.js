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

  static updateById (endpointId, sessionName, device) {
    db.get('devices')
      .find({
        endpointId,
        sessionName
      })
      .assign(Object.assign(device))
      .write()
  }

  static updateStateById (endpointId, sessionName, oldStates, newStates) {
    db.get('devices')
      .find({
        endpointId,
        sessionName
      })
      .assign({
        states: updateState(newStates, oldStates)
      })
      .write()
  }

  static updateOfSession (oldDevices, newDevices, sessionName) {
    newDevices = newDevices
      .map(it => Object.assign({}, it, { sessionName }))

    const allDevices = Device.getAllDevices()
    db.set('devices',
      _.unionBy(newDevices, allDevices,
        it => it.sessionName + ':' + it.endpointId
      )
    ).write()
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
