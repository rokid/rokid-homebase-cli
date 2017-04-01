const inquirer = require('inquirer');
const program = require('commander');
const pkg = require('./package.json');

const low = require('lowdb');
const config = require('./lib/config');

const colors = require('colors');
const {table} = require('table');

const serialize = value => JSON.stringify(value, null, 2);
const db = low(config.dbPath, { format: { serialize }});

const url = require('url');
const request = require('./lib/requestAction');


//about jsonschema
const apiCommon = require('./jsonschema/api-common.json');
const apiList = require('./jsonschema/api-list.json');
const apiGet = require('./jsonschema/api-get.json');
const apiExecute = require('./jsonschema/api-execute.json');
const device = require('./jsonschema/device.json');
const actions = require('./jsonschema/actions.json');
const state = require('./jsonschema/state.json');
const execAction = require('./jsonschema/action.json');

const Validator = require('jsonschema').Validator;
const v = new Validator();

v.addSchema(apiCommon, '/api-common');
v.addSchema(device, '/device');
v.addSchema(actions, '/actions');
v.addSchema(state, '/state');


db.defaults({
  sessions: [],
  devices: []
})
  .write();

program
  .command('add')
  .description('add a remote driver\'s session')
  .action(add);

program
  .command('del <name>')
  .description('delete a remote driver\'s session')
  .action(del);

program
  .command('sessions')
  .description('list all added sessions')
  .action(sessions);

program
  .command('use <name>')
  .description('user an added session')
  .action(use);

program
  .command('list')
  .description('list a driver\'s all devices')
  .action(list);

program
  .command('get <id>')
  .description('get one device\'s current state')
  .action(get);

program
  .command('execute <id> <action>')
  .description('execute the device<id> with target action(e.g switch=on | color=12345)')
  .action(execute);

program
  .command('command <name>')
  .description('')
  .action(command);

program
  .command('*', { isDefault: true })
  .description('show help')
  .action(function(){
    program.help();
  });

program
  .version(pkg.version)
  .option('-b, --body', 'show response body of list/get/execute')
  .option('-l, --local', 'list local devices')
  .parse(process.argv);

function add() {

  const sessions = db.get('sessions');

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'remote driver\'s name',
      validate: function(value) {
        const isExisted = sessions.find({ name: value }).value();
        //add first time
        if (value && sessions.value().length === 0) {
          return true;
        }
        if (value && !isExisted) {
          return true;
        }
        return 'Name is null or existed, please input again'
      }
    },
    {
      type: 'input',
      name: 'endpoint',
      message: 'remote driver\'s endpoint',
      default: 'http://127.0.0.1:3000'
    },
    {
      type: 'input',
      name: 'userId',
      message: 'userId in userAuth. If null, skip'
    },
    {
      type: 'input',
      name: 'userToken',
      message: 'userToken in userAuth. If null, skip'
    },
  ];

  inquirer.prompt(questions).then(function (answers) {
    console.log(JSON.stringify(answers, null, 2));

    const session = {
      name: answers.name,
      endpoint: answers.endpoint,
      userAuth: {
        userId: answers.userId,
        userToken: answers.userToken
      }
    };

    sessions
      .push(session)
      .write();

    //default sessions[0] in use
    if (!db.get('currentSession').value()) {
      db.set('currentSession', answers.name)
        .write();
    }
  });
}

function del(name) {

  const sessions = db.get('sessions').value();

  if (sessions.length === 0) {
    console.log('please add first');
    return;
  }

  if (!sessions.some(session => session.name === name)) {
    console.log('no such name, please try again');
    return;
  }

  db.get('sessions')
    .remove({name: name})
    .write();

  if (db.get('currentSession').value() === name) {
    if(sessions.length === 0) {
      db.unset('currentSession')
        .write();
    } else {
      db.set('currentSession', sessions[0].name)
        .write();
    }
  }

  const devices = db.get('devices');
  if(devices.value().length !== 0) {
    devices
      .remove({sessionName: name})
      .write();
  }
}

function sessions() {

  const sessions = db.get('sessions').value();
  const currentSession = db.get('currentSession').value();

  if (sessions.length === 0) {
    console.log('please add first');
    return;
  }

  let sessionsTable = [];
  sessionsTable.push(['name'.red, 'endpoint'.red, 'userId'.red, 'useToken'.red, 'in use'.red]);

  sessions.forEach(session => {
    if (session.name === currentSession) {
      sessionsTable.push([session.name, session.endpoint, session.userAuth.userId, session.userAuth.userToken, '*****'])
    } else {
      sessionsTable.push([session.name, session.endpoint, session.userAuth.userId, session.userAuth.userToken, '']);
    }
  });

  console.log(table(sessionsTable));
}

function use(name) {
  const isExisted = db.get('sessions').find({ name: name }).value();
  if (!name) {
    console.log('Name can not be null, please input again');
  } else {
    if (!isExisted) {
      console.log(`${name} is not added, please add first`);
    } else {
      db.set('currentSession', name)
        .write();
      console.log(`${name} is in use`);
    }
  }
}

function list() {
  const currentSession = db.get('currentSession').value();

  if (!currentSession) {
    console.log('please add first');
    return;
  }

  const session = db.get('sessions').find({ name: currentSession }).value();
  const listUrl = url.resolve(session.endpoint, 'list');

  const localDevices = db.get('devices').value();
  if(localDevices.length === 0) {
    console.log('please list first');
    return;
  }

  if(program.local) {
    listDevices(localDevices);
  } else {
    request(listUrl, session.userAuth)
      .then(body => {

        if(program.body) {
          console.log(colors.yellow('response body:'));
          console.log(JSON.stringify(body, null, 2));
        }

        const errors = v.validate(body, apiList).errors;
        if (errors.length === 0) {
          const status = body.status;

          if (status === 0) {
            const devices = body.data;
            devices
              .map(device => Object.assign(device, {sessionName: currentSession}))
              .forEach(device => {
                if(!localDevices.some(item => item.deviceId === device.deviceId && item.sessionName === currentSession)){
                  localDevices.push(device);
                }
              });

            db.set('devices',localDevices)
              .write();

            listDevices(devices);
          } else {
            console.log(`errorStatus: ${status}`.red)
          }
        } else {
          console.log(colors.yellow('body checked by json schema:'));
          errors.forEach(error => console.log(colors.red(error.stack)))
        }
      })
  }
}

function get(id) {
  const currentSession = db.get('currentSession').value();

  if (!currentSession) {
    console.log('please add first');
    return;
  }

  const session = db.get('sessions').find({ name: currentSession }).value();
  const getUrl = url.resolve(session.endpoint, 'get');
  const localDevices = db.get('devices').value();
  const targetDevcie = localDevices[id];
  targetDevcie.sessionName = undefined;

  if(localDevices.length === 0) {
    console.log('please list first');
    return;
  }

  if(id > localDevices.length) {
    console.log('no such id, please try again');
    return;
  }

  if(program.local) {
    listDevice(localDevices[id]);
  } else {
    request(getUrl, {
      device:targetDevcie,
      userAuth: session.userAuth
    })
      .then(body => {
        if(program.body) {
          console.log(colors.yellow('response body:'));
          console.log(JSON.stringify(body, null, 2));
        }
        const errors = v.validate(body, apiGet).errors;
        if(errors.length === 0) {
          const status = body.status;
          if (status === 0) {
            const data = body.data;
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
            console.log(`errorStatus: ${status}`.red)
          }
        } else {
          console.log(colors.yellow('body checked by json schema:'));
          errors.forEach(error => console.log(colors.red(error.stack)))
        }
      })
  }
}

function execute(id, action) {

  const currentSession = db.get('currentSession').value();

  if (!currentSession) {
    console.log('please add first');
    return;
  }

  const session = db.get('sessions').find({ name: currentSession }).value();
  const executeUrl = url.resolve(session.endpoint, 'execute');

  const localDevices = db.get('devices').value();
  const targetDevcie = localDevices[id];
  targetDevcie.sessionName = undefined; //????

  if(localDevices.length === 0) {
    console.log('please list first');
    return;
  }

  if(id > localDevices.length) {
    console.log('no such id, please try again');
    return;
  }

  const arr = action.split('=');
  const actionObj = {};
  actionObj[arr[0]] = arr[1];

  const actionError = v.validate(actionObj, execAction).errors;
  if(actionError.length === 0) {
    request(executeUrl,{
      device: Object.assign({},targetDevcie, {
        userAuth: session.userAuth
      }),
      action: actionObj
    })
      .then(body => {
        if(program.body) {
          console.log(colors.yellow('response body:'));
          console.log(JSON.stringify(body, null, 2));
        }
        const errors = v.validate(body, apiExecute).errors;
        if(errors.length === 0) {
          if (body.status === 0) {

            const state = Object.assign({}, targetDevcie.state, body.data);
            targetDevcie.sessionName = currentSession;
            db.get('devices')
              .find({
                deviceId: targetDevcie.deviceId,
                sessionName: currentSession
              })
              .assign({state: state})
              .write();

          } else {
            console.log(`errorStatus: ${status}`.red)
          }
        } else {
          console.log(colors.yellow('body checked by json schema:'));
          errors.forEach(error => console.log(colors.red(error.stack)))
        }
      })
  } else {
    console.log(colors.yellow('input checked by json schema:'));
    actionError.forEach(error => console.log(colors.red(error.stack)))
  }

}

function command() {}

function listDevices(devices) {
  devices.forEach((device,index) => {
    console.log(`id: ${index}`.yellow);
    console.log( `sessionName: ${device.sessionName}`.yellow);
    console.log(`deviceId: ${device.deviceId}`);
    console.log(`name: ${device.name}`);
    console.log(`type: ${device.type}`);
    console.log(`offline: ${device.offline}`);
    console.log();
  });
}

function listDevice(device) {
  console.log( `sessionName: ${device.sessionName}`.yellow);
  console.log(`deviceId: ${device.deviceId}`);
  console.log(`name: ${device.name}`);
  console.log(`type: ${device.type}`);
  console.log(`offline: ${device.offline}`);
  console.log();
}