const request = require('request-promise-native')
const debug = require('debug')('rhome')
const v = require('../jsonschema')
const httpCommon = require('../../jsonschema/api-common-http.json')
const log = require('../../lib/log')

module.exports = function (endpoint, method, data) {
  endpoint = endpoint.replace(/\/?$/, '/')
  return request(
    { url: endpoint + method,
      json: true,
      body: data,
      method: 'POST'
    })
    .then(res => {
      debug(`${JSON.stringify(res)}\n`)
      const errors = v.validate(res, httpCommon).errors
      if (errors.length === 0) {
        if (res.status === 0) {
          return res.data
        } else {
          let error = new Error(res.message || 'unknown message')
          error.status = res.status
          error.errorName = res.errorName || 'unknown'

          throw error
        }
      } else {
        log.jsonErrors(errors)
      }
    })
}
