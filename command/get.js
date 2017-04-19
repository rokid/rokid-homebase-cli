const debug = require('debug');
const low = require('lowdb');
const config = require('../lib/config');
const colors = require('colors');
const serialize = value => JSON.stringify(value, null, 2);
const db = low(config.dbPath, {format: {serialize}});
const request = require('../lib/requestAction');
const v = require('../lib/jsonschema')();
const apiGet = require('../jsonschema/api-get.json');

module.exports = function (id, command) {
  const currentSession = db.get('currentSession').value();

  if (!currentSession) {
    console.log('please add first');
    return;
  }

  const session = db.get('sessions').find({name: currentSession}).value();
  const localDevices = db.get('devices').filter({sessionName: currentSession}).value();
  const targetDevcie = localDevices[id];
  targetDevcie.sessionName = undefined;

  if (localDevices.length === 0) {
    console.log('please list first');
    return;
  }

  if (id > localDevices.length) {
    console.log('no such id, please try again');
    return;
  }

  if (command.local) {
    listDevice(localDevices[id]);
  } else {
    request('get', session.endpoint, {
      device: targetDevcie,
      userAuth: session.userAuth
    })
      .then(data => {
        if (command.data) {
          console.log(colors.yellow('response data:'));
          console.log(JSON.stringify(data, null, 2));
        }
        const errors = v.validate(data, apiGet).errors;
        if (errors.length === 0) {
          targetDevcie.sessionName = currentSession;
          db.get('devices')
            .find({
              deviceId: targetDevcie.deviceId,
              sessionName: currentSession
            })
            .assign(Object.assign(data))
            .write();

          listDevice(data);
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

function listDevice(device) {
  console.log(`sessionName: ${device.sessionName}`.yellow);
  console.log(`deviceId: ${device.deviceId}`);
  console.log(`name: ${device.name}`);
  console.log(`type: ${device.type}`);
  console.log(`offline: ${device.offline}`);
  console.log();
}
