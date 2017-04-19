const _ = require('lodash');
const updateState = require('../lib/update-state');
const debug = require('debug');
const low = require('lowdb');
const config = require('../lib/config');
const colors = require('colors');
const {table} = require('table');
const serialize = value => JSON.stringify(value, null, 2);
const db = low(config.dbPath, {format: {serialize}});
const request = require('../lib/requestAction');
const v = require('../lib/jsonschema')();
const apiList = require('../jsonschema/api-list.json');

module.exports = function (command) {

  const currentSession = db.get('currentSession').value();

  if (!currentSession) {
    console.log('please add first');
    return;
  }

  const session = db.get('sessions').find({name: currentSession}).value();

  let localDevices = db.get('devices').filter({sessionName: currentSession}).value();
  let allDevices = db.get('devices').value();

  if (command.local) {
    if (localDevices.length === 0) {
      console.log('please list first');
      return;
    }
    listDevices(localDevices);
  } else {
    request('list', session.endpoint, session.userAuth)
      .then(data => {

        if (command.data) {
          console.log(colors.yellow('response data:'));
          console.log(JSON.stringify(data, null, 2));
        }

        const errors = v.validate(data, apiList).errors;
        if (errors.length === 0) {
          const foundDevices = data;

          foundDevices
            .map(device => Object.assign(device, {sessionName: currentSession}))
            .map(device => {
              let currentDevice = _.find(localDevices, {
                deviceId: device.deviceId,
                sessionName: currentSession
              });

              if (currentDevice) {
                return Object.assign({}, currentDevice, device, {
                  state: updateState(device.state, currentDevice.state)
                });
              } else {
                allDevices.push(device);
                return device;
              }
            });

          allDevices = _.chain(allDevices)
            .map(device => {
              const foundDevice = _.find(foundDevices, {
                deviceId: device.deviceId,
                sessionName: currentSession
              });

              if (!foundDevice) {
                return device;
              } else {
                return foundDevice
              }
            });

          db.set('devices', allDevices)
            .write();

          listDevices(foundDevices);
        } else {
          console.log(colors.yellow('body checked by json schema:'));
          errors.forEach(error => console.log(colors.red(error.stack)))
        }
      })
      .catch(error => {
        console.error(`status: ${error.status}`);
        console.error(`errorName: ${error.errorName}`);
        console.error(`message: ${error.message}`);
      });
  }
};

function listDevices(devices) {
  devices.forEach((device, index) => {
    console.log(`id: ${index}`.yellow);
    console.log(`sessionName: ${device.sessionName}`.yellow);
    console.log(`deviceId: ${device.deviceId}`);
    console.log(`name: ${device.name}`);
    console.log(`type: ${device.type}`);
    console.log(`offline: ${device.offline}`);
    console.log();
  });
}