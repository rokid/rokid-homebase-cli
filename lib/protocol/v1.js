
const _ = require('lodash')
const { URL } = require('url')

const { validate } = require('../schema')
const { ProtocolError } = require('../custom-errors')
const { device2Endpoint, endpoint2Device } = require('../transformation')

function handleResponse (response) {
  if (response.status === 0) {
    return response.data
  } else {
    throw new ProtocolError(response.errorName, response.message, response)
  }
}

class Protocol {
  /**
   *
   * @param {(endpoint, data) => Promise<any>} request
   * @param {URL} endpoint
   * @param {{ userId: string, userToken: string }} userAuth
   */
  constructor (request, endpoint, userAuth) {
    this.request = request
    this.endpoint = endpoint
    this.userAuth = userAuth
  }

  async discover () {
    const endpoint = new URL(this.endpoint)
    endpoint.pathname += '/list'
    const response = await this.request(
      endpoint.toString(),
      { userAuth: this.userAuth }
    )
    validate([ '/api-common-http' ], response)
    const data = handleResponse(response)
    validate([ '/api-list' ], data)
    return _.map(data, device2Endpoint)
  }

  /**
   *
   * @param {string} command pattern like '\w+\.\w+', e.g. 'Switch.On'
   * @param {Device[]} endpoints
   * @param {{value: any}} payload
   */
  async control (command, endpoints, payload) {
    const url = new URL(this.endpoint)
    url.pathname += '/execute'

    const [ property, name ] = _.map(command.split('.'), _.lowerCase)
    const action = Object.assign({}, payload, {
      property, name
    })
    if (name === 'num') {
      action.value = parseInt(action.value, 10)
    }
    return Promise.all(endpoints.map(async endpoint => {
      endpoint = endpoint2Device(endpoint)
      const response = await this.request(
        url.toString(),
        {
          device: Object.assign(
            {},
            _.pick(endpoint, ['deviceId', 'state', 'deviceInfo']),
            { userAuth: this.userAuth }
          ),
          action
        }
      )
      validate([ '/api-common-http' ], response)
      const data = handleResponse(response)
      validate([ '/api-execute' ], data)
      return data
    }))
  }

  async query (endpoints) {
    const url = new URL(this.endpoint)
    url.pathname += '/get'
    return Promise.all(endpoints.map(async endpoint => {
      endpoint = endpoint2Device(endpoint)
      const response = await this.request(
        url.toString(),
        {
          device: _.pick(endpoint, ['deviceId', 'state', 'deviceInfo']),
          userAuth: this.userAuth
        }
      )
      validate([ '/api-common-http' ], response)
      const data = handleResponse(response)
      validate([ '/api-get' ], data)
      return data
    }))
  }
}

module.exports = Protocol
