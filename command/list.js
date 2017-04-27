const colors = require('colors');
const Session = require('../lib/session');
const Device = require('../lib/device');
const v = require('../lib/jsonschema');
const apiList = require('../jsonschema/api-list.json');
const log = require('../lib/log');

module.exports = function (command) {

  const currentSessionName = Session.getCurrentSessionName();
  const session = new Session();

  if (!currentSessionName) {
    console.log('please add first');
    return;
  }

  const devicesOfSession = Device.getBySessionName(currentSessionName);

  if (command.local) {
    if (devicesOfSession.length === 0) {
      console.log('please list first');
      return;
    }
    log.listDevices(devicesOfSession);
  } else {
    session.request('list', { userAuth: Session.getCurrentSession().userAuth })
      .then(data => {

        if (command.data) {
          console.log(colors.yellow('response data:'));
          console.log(`${JSON.stringify(data)}\n`);
        }

        const errors = v.validate(data, apiList).errors;

        if (errors.length === 0) {
          Device.updateOfSession(devicesOfSession, data, currentSessionName);
          log.listDevices(data);

        } else {
          console.log(colors.yellow('body checked by json schema:'));
          log.jsonErrors(errors);
        }
      })
      .catch(error => log.resError(error));
  }
};


