const jayson = require('jayson');
const debug = require('debug')('rhome');
const v = require('../jsonschema');
const tcpCommon = require('../../jsonschema/api-common-tcp.json');
const log = require('../../lib/log');

module.exports = function (host, port, method, data) {
  return new Promise((resolve, reject) => {
    const client = jayson.Client.tcp({
      port: port,
      host: host
    });
    client.request(method, Object.assign({}, data, {
      version: '1.0.0'
    }), function(err, response){
      if (err) {
        reject(err);
      } else {
        debug(`${JSON.stringify(response)}\n`);
        const errors = v.validate(response, tcpCommon).errors;
        if (errors.length === 0) {
          if (response.error) {
            const error = new Error();
            error.status = response.error.status;
            error.errorName = response.error.errorName || 'unknown';
            error.message = response.error.message || 'unknown message';

            throw error;
          } else {
            resolve(response.result);
          }
        } else {
          log.jsonErrors(errors);
        }
      }
    });
  });
};