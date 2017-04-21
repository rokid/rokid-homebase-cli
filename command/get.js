const colors = require('colors');
const Session = require('../lib/session');
const Device = require('../lib/device');
const v = require('../lib/jsonschema');
const apiGet = require('../jsonschema/api-get.json');

module.exports = function (id, command) {

  const currentSessionName = Session.getCurrentSessionName();
  const session = new Session(currentSessionName);

  if (!currentSessionName) {
    console.log('please add first');
    return;
  }

  const devicesOfSession = Device.getBySessionName(currentSessionName);
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
    session.request('get', {
      device: targetDevice,
      userAuth: Session.getCurrentSession().userAuth
    })
      .then(data => {
        if (command.data) {
          console.log(colors.yellow('response data:'));
          console.log(JSON.stringify(data, null, 2));
        }
        const errors = v.validate(data, apiGet).errors;
        if (errors.length === 0) {
          targetDevice.sessionName = currentSessionName;
          Device.updateById(targetDevice.deviceId, currentSessionName, data);

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
