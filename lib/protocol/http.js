const request = require('request-promise-native');
const url = require('url');
const debug = require('debug')('rhome');
const v = require('../jsonschema');
const httpCommon = require('../../jsonschema/api-common-http.json');
const colors = require('colors');

module.exports = function (endpoint, method, data) {
  endpoint = endpoint.replace(/\/?$/, '/');
  return request(
    { url: endpoint + method,
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
};
