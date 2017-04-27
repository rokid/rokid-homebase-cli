const colors = require('colors');
const Session = require('../lib/session');
const Device = require('../lib/device');
const v = require('../lib/jsonschema');
const apiGet = require('../jsonschema/api-get.json');
const log = require('../lib/log');

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
    log.listDevice(targetDevice);
  } else {
    targetDevice.sessionName = undefined;
    session.request('get', {
      device: targetDevice,
      userAuth: Session.getCurrentSession().userAuth
    })
      .then(data => {
        if (command.data) {
          console.log(colors.yellow('response data:'));
          console.log(`${JSON.stringify(data)}\n`);
        }
        const errors = v.validate(data, apiGet).errors;
        if (errors.length === 0) {
          targetDevice.sessionName = currentSessionName;
          Device.updateById(targetDevice.deviceId, currentSessionName, data);

          log.listDevice(data);
        } else {
          console.log(colors.yellow('body checked by json schema:'));
          log.jsonErrors(errors)
        }
      })
      .catch(error => log.resError(error));
  }
};
