const inquirer = require('inquirer');
const Session = require('../lib/session');

module.exports = function () {

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'remote driver\'s name',
      validate: function (value) {
        const isName = /^\w+$/.test(value);
        const isExisted = Session.getSessionByName(value);
        //add first time
        if (!isName) {
          return 'Name must be only characters, numbers and underscore, please input again.'
        }
        if (Session.getAllSessions().length === 0) {
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

    Session.addSession(newSession);

    //default sessions[0] in use
    if (!Session.getCurrentSessionName()) {
      Session.setCurrentSession(answers.name)
    }
  });
};