const low = require('lowdb');
const config = require('../lib/config');
const serialize = value => JSON.stringify(value, null, 2);
const db = low(config.dbPath, {format: {serialize}});

module.exports = function (name) {
  const isExisted = db.get('sessions').find({name: name}).value();
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
};