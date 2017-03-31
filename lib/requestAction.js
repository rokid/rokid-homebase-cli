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
      body: data,
      method: 'POST'
    })
    .catch(err => console.log(err.stack)); //需要结束掉？
}


