const colors = require('colors');

exports.jsonErrors = function(errors) {
  errors.forEach(error => {
    console.log(colors.red(error.stack));
    console.log(`detail:${JSON.stringify(error.instance)}\n`);
  });
};

exports.resError = function(error) {
  console.error(`status: ${error.status}`);
  console.error(`errorName: ${error.errorName}`);
  console.error(`message: ${error.message}`);
};

exports.listDevices = function(devices) {
  devices.forEach((device, index) => {
    console.log(`id: ${index}`.yellow);
    console.log(`sessionName: ${device.sessionName}`.yellow);
    console.log(`deviceId: ${device.deviceId}`);
    console.log(`name: ${device.name}`);
    console.log(`type: ${device.type}`);
    console.log(`offline: ${device.offline}`);
    console.log();
  });
};

exports.listDevice = function(device) {
  console.log(`sessionName: ${device.sessionName}`.yellow);
  console.log(`deviceId: ${device.deviceId}`);
  console.log(`name: ${device.name}`);
  console.log(`type: ${device.type}`);
  console.log(`offline: ${device.offline}`);
  console.log();
};