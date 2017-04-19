const _ = require('lodash');
const debug = require('debug');
const low = require('lowdb');
const config = require('../lib/config');
const colors = require('colors');
const serialize = value => JSON.stringify(value, null, 2);
const db = low(config.dbPath, {format: {serialize}});
const request = require('../lib/requestAction');
const v = require('../lib/jsonschema')();
const apiExecute = require('../jsonschema/api-execute.json');
const execAction = require('../jsonschema/action.json');

module.exports = function (id, prop, name, val, command) {

  const currentSession = db.get('currentSession').value();

  if (!currentSession) {
    console.log('please add first');
    return;
  }

  const session = db.get('sessions').find({name: currentSession}).value();

  const localDevices = db.get('devices').filter({sessionName: currentSession}).value();

  if (localDevices.length === 0) {
    console.log('please list first');
    return;
  }

  if (id > localDevices.length) {
    console.log('no such id, please try again');
    return;
  }

  const targetDevcie = localDevices[id];
  targetDevcie.sessionName = undefined;

  //format action
  let action = {};
  action.property = prop;
  action.name = name;
  if (name === 'num') {
    action.value = parseInt(val);
  }

  const actionError = v.validate(action, execAction).errors;
  // console.log(JSON.stringify(targetDevcie, null, 2));
  if (actionError.length === 0) {
    request('execute', session.endpoint, {
      device: Object.assign({}, _.pick(targetDevcie, ['deviceId','state','deviceInfo']), {
        userAuth: session.userAuth
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
          const state = Object.assign({}, targetDevcie.state, data);
          targetDevcie.sessionName = currentSession;
          db.get('devices')
            .find({
              deviceId: targetDevcie.deviceId,
              sessionName: currentSession
            })
            .assign({state: state})
            .write();
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
