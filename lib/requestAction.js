const request = require('request-promise-native');
const jayson = require('jayson');
const url = require('url');
const colors = require('colors');
const debug = require('debug')('rhome');
const v = require('./jsonschema')();
const httpCommon = require('../jsonschema/api-common-http.json');
const tcpCommon = require('../jsonschema/api-common-tcp.json');

module.exports = requestAction;

/**
 * request remote driver
 * @param method
 * @param endpoint
 * @param data
 * @returns {Promise.<Object>}
 */
function requestAction(method, endpoint, data) {

  const URL = url.parse(endpoint);
  switch(URL.protocol){
    case 'http:':
      return request(
        { url: url.resolve(endpoint, method),
          json: true,
          body: data,
          method: 'POST'
        })
        .then(res => {
          debug(JSON.stringify(res, null, 2));
          const errors = v.validate(res, httpCommon).errors;
          if (errors.length === 0) {
            if (res.status === 0) {
              return res.data;
            } else {
              let error = new Error(res.message || 'unknown message');
              error.status = res.status;
              error.errorName = res.errorName || 'unknown';

              throw error;
            }
          } else {
            errors.forEach(error => console.log(colors.red(error.stack)))
          }
        });
    case 'tcp:':
      return new Promise((resolve, reject) => {
        const client = jayson.Client.tcp({
          port: URL.port,
          host: URL.hostname
        });
        client.request(method, Object.assign({}, data, {
          version: '1.0.0'
        }), function(err, response){
          if (err) {
            reject(err);
          } else {
            debug(JSON.stringify(response, null, 2));
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
              errors.forEach(error => console.log(colors.red(error.stack)))
            }
          }
        });
      });
  }
}


