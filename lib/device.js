const _ = require('lodash');
const db = require('./db');
const updateState = require('./update-state');

function Device() {
  this.devices = db.get('devices');
  this.allDevices = this.devices.value();
}

Device.prototype.getBySessionName = function (sessionName) {
  return this.devices.filter({sessionName: sessionName }).value()
};

Device.prototype.updateById = function (deviceId, sessionName, device) {
  this.devices
    .find({
      deviceId: deviceId,
      sessionName: sessionName
    })
    .assign(Object.assign(device))
    .write();
};

Device.prototype.updateStateById = function (deviceId, sessionName, oldState, newState) {
  this.devices
    .find({
      deviceId: deviceId,
      sessionName: sessionName
    })
    .assign({state: updateState(newState, oldState)})
    .write();
};

Device.prototype.updateOfSession = function (oldDevices, newDevices, sessionName) {
  const self = this;

  newDevices
    .map(device => Object.assign(device, {sessionName: sessionName}))
    .map(device => {
      let currentDevice = _.find(oldDevices, {
        deviceId: device.deviceId,
        sessionName: sessionName
      });

      if (currentDevice) {
        return Object.assign({}, currentDevice, device, {
          state: updateState(currentDevice.state, device.state)
        });
      } else {
        this.allDevices.push(device);
        return device;
      }
    });

  this.allDevices = _.chain(self.allDevices)
    .map(device => {
      const newDevice = _.find(newDevices, {
        deviceId: device.deviceId,
        sessionName: sessionName
      });

      if (!newDevice) {
        return device;
      } else {
        return newDevice
      }
    });

  db.set('devices', self.allDevices)
    .write();
};

Device.prototype.removeBySessionName = function (sessionName) {
  this.devices
    .remove({sessionName: sessionName})
    .write();
};

module.exports = Device;
