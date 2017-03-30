const dataSchema = require('../jsonschema/api-common.json');
const deviceSchema = require('../jsonschema/device.json');
const actionsSchema = require('../jsonschema/actions.json');
const stateSchema = require('../jsonschema/state.json');

const data = {
  "status": 1,
  "data": {
    "deviceId": "06d0dfe0-1123-11e7-93ae-92361f002671",
    "name": "智慧灯泡",
    "type": "light",
    "actions": {
      "switch": [
        "on",
        "off"
      ],
      "color": [
        "num"
      ],
      "brightness": [
        "num"
      ]
    },
    "state": {
      "switch": "on",
      "color": 256,
      "brightness": 10
    },
    "offline": false,
    "deviceInfo": {
      "hostname": "http://127.0.0.1",
      "port": "3000"
    },
    "parent": "5883b713-709c-4a4a-82e1-44d7671d95db"
  }
};

const Validator = require('jsonschema').Validator;
const v = new Validator();
console.log(v.validate(data, dataSchema));
