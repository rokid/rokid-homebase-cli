const SSDPClient = require('../lib/protocol/ssdp-client');

module.exports = function (command) {

  const client = SSDPClient({
    onDeviceAlive: onDeviceAlive,
    onDeviceOffline: onDeviceOffline,
    onDeviceResponse: onDeviceResponse
  }, command.parent);

  client.search();

  setInterval(() => client.search(), 10000);
};

function onDeviceAlive(device) {
  // console.log(device)
}

function onDeviceOffline(device) {
  // console.log(device)
}

function onDeviceResponse(device) {
  // console.log(device)
}