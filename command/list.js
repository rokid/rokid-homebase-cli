const colors = require('colors');
const Session = require('../lib/session');
const Device = require('../lib/device');
const request = require('../lib/requestAction');
const v = require('../lib/jsonschema')();
const apiList = require('../jsonschema/api-list.json');

module.exports = function (command) {

  const session = new Session();
  const device = new Device();

  if (!session.currentSessionName) {
    console.log('please add first');
    return;
  }

  const devicesOfSession = device.getBySessionName(session.currentSessionName);

  if (command.local) {
    if (devicesOfSession.length === 0) {
      console.log('please list first');
      return;
    }
    listDevices(devicesOfSession);
  } else {
    request('list', session.currentSession.endpoint, session.currentSession.userAuth)
      .then(data => {

        if (command.data) {
          console.log(colors.yellow('response data:'));
          console.log(JSON.stringify(data, null, 2));
        }

        const errors = v.validate(data, apiList).errors;

        if (errors.length === 0) {

          device.updateOfSession(devicesOfSession, data, session.currentSessionName);
          listDevices(data);

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