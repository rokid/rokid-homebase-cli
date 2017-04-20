const colors = require('colors');
const Session = require('../lib/session');
const Device = require('../lib/device');
const request = require('../lib/requestAction');
const v = require('../lib/jsonschema')();
const apiGet = require('../jsonschema/api-get.json');

module.exports = function (id, command) {
  
  const session = new Session();
  const device = new Device();
  
  if (!session.currentSessionName) {
    console.log('please add first');
    return;
  }

  const devicesOfSession = device.getBySessionName(session.currentSessionName);
  const targetDevice = devicesOfSession[id];

  if (devicesOfSession.length === 0) {
    console.log('please list first');
    return;
  }

  if (id > devicesOfSession.length) {
    console.log('no such id, please try again');
    return;
  }

  if (command.local) {
    listDevice(targetDevice);
  } else {
    targetDevice.sessionName = undefined;
    request('get', session.currentSession.endpoint, {
      device: targetDevice,
      userAuth: session.currentSession.userAuth
    })
      .then(data => {
        if (command.data) {
          console.log(colors.yellow('response data:'));
          console.log(JSON.stringify(data, null, 2));
        }
        const errors = v.validate(data, apiGet).errors;
        if (errors.length === 0) {
          targetDevice.sessionName = session.currentSessionName;
          device.updateById(targetDevice.deviceId, session.currentSessionName, data);

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
