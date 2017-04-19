const path = require('path');
const server = require('../lib/local-server');

module.exports = function (pathname, port) {
  server(path.resolve(pathname), port);
};
