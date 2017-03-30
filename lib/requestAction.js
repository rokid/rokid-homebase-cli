const request = require('request-promise-native');

module.exports = requestAction;

/**
 * request remote driver
 * @param endpoint
 * @param data
 * @returns {Promise.<Object>}
 */
function requestAction(endpoint, data) {

  return request(
    { url: endpoint,
      json: true,
      body: JSON.stringify(data),
      method: 'POST'
    } )
    .then(body => {
      if (body.status > 0) {
        let error = new Error(`Driver-debug Error${JSON.stringify(body)} [${body.status}]`);
        error.errorName = 'E_DRIVER_ERROR';
        throw error;
      }
      return body.data;
    })
}


