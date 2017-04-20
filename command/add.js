const inquirer = require('inquirer');
const Session = require('../lib/session');

module.exports = function () {

  const session = new Session();

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'remote driver\'s name',
      validate: function (value) {
        const isName = /^\w+$/.test(value);
        const isExisted = session.getSessionByName(value);
        //add first time
        if (!isName) {
          return 'Name must be only characters, numbers and underscore, please input again.'
        }
        if (session.allSessions.length === 0) {
          return true;
        }
        if (!isExisted) {
          return true;
        } else {
          return 'It\'s existed, please input again'
        }
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

    const newSession = {
      name: answers.name,
      endpoint: answers.endpoint,
      userAuth: {
        userId: answers.userId,
        userToken: answers.userToken
      }
    };

    session.addSession(newSession);

    //default sessions[0] in use
    if (!session.currentSessionName) {
      session.setCurrentSession(answers.name)
    }
  });
};