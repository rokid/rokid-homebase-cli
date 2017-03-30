const inquirer = require('inquirer');
const program = require('commander');
const pkg = require('./package.json');

const low = require('lowdb');
const config = require('./lib/config');

const Table = require('cli-table');

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

const Validator = require('jsonschema').Validator;
const v = new Validator();

v.addSchema(apiCommon, 'api-common');
v.addSchema(device, 'device');
v.addSchema(actions, 'actions');
v.addSchema(state, 'state');


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
  .description('execute the device<id> with target action(format as json)')
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

function sessions() {

  // instantiate
  const sessionsTable = new Table({
    head: ['name', 'endpoint', 'userId', 'useToken', 'in use']
  });

  const sessions = db.get('sessions').value();
  const currentSession = db.get('currentSession').value();

  if (sessions.length === 0) {
    console.log('please add first');
    return;
  }

  sessions.forEach(session => {
    if (session.name === currentSession) {
      sessionsTable.push([session.name, session.endpoint, session.userAuth.userId, session.userAuth.userToken, '*****'])
    } else {
      sessionsTable.push([session.name, session.endpoint, session.userAuth.userId, session.userAuth.userToken, '']);
    }
  });

  console.log(sessionsTable.toString());
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
  return request(listUrl, {
    userAuth: session.userAuth
  })
    .then()


}

function get(id) {}

function execute(id, action) {}

function command() {}

