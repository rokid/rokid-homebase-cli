const _ = require('lodash');
const colors = require('colors');
const Session = require('../lib/session');
const Device = require('../lib/device');
const request = require('../lib/requestAction');
const v = require('../lib/jsonschema');
const apiExecute = require('../jsonschema/api-execute.json');
const execAction = require('../jsonschema/action.json');

module.exports = function (id, prop, name, val, command) {
  
  const session = new Session();
  const device = new Device();


  if (!session.currentSessionName) {
    console.log('please add first');
    return;
  }

  const devicesOfSession = device.getBySessionName(session.currentSessionName);

  if (devicesOfSession.length === 0) {
    console.log('please list first');
    return;
  }

  if (id > devicesOfSession.length) {
    console.log('no such id, please try again');
    return;
  }

  const targetDevice = devicesOfSession[id];
  targetDevice.sessionName = undefined;

  //format action
  let action = {};
  action.property = prop;
  action.name = name;
  if (name === 'num') {
    action.value = parseInt(val);
  }

  const actionError = v.validate(action, execAction).errors;
  // console.log(JSON.stringify(targetDevice, null, 2));
  if (actionError.length === 0) {
    request('execute', session.currentSession.endpoint, {
      device: Object.assign({}, _.pick(targetDevice, ['deviceId','state','deviceInfo']), {
        userAuth: session.currentSession.userAuth
      }),
      action: action
    })
      .then(data => {
        if (command.data) {
          console.log(colors.yellow('response data:'));
          console.log(JSON.stringify(data, null, 2));
        }
        const errors = v.validate(data, apiExecute).errors;
        if (errors.length === 0) {
          targetDevice.sessionName = session.currentSessionName;

          device.updateStateById(targetDevice.deviceId, session.currentSessionName, targetDevice.state, data)

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
  } else {
    console.log(colors.yellow('input checked by json schema:'));
    actionError.forEach(error => console.log(colors.red(error.stack)))
  }
};
