
const { v4: uuid } = require('uuid')

const { ajv } = require('../schema')

function constructMessage ({ namespace, name, authentication, endpoints = [], payload = {} }) {
  return {
    header: {
      messageId: uuid(),
      namespace,
      name,
      payloadVersion: '1',
      authentication
    },
    endpoints,
    payload
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
    const response = await this.request(
      this.endpoint,
      constructMessage({
        namespace: 'Rokid.Discovery',
        name: 'Discover',
        authentication: this.userAuth
      })
    )
    if (response == null) {
      throw new Error('response is nil')
    }
    if (!ajv.validate('/v2-discover-response', response)) {
      throw new Error(ajv.errorsText())
    }
    return response.endpoints
  }

  async control (command, endpoints, payload) {
    const response = await this.request(
      this.endpoint,
      constructMessage({
        namespace: 'Rokid.Control',
        name: command,
        authentication: this.userAuth,
        endpoints,
        payload
      })
    )
    if (response == null) {
      throw new Error('response is nil')
    }
    if (!ajv.validate('/v2-response-message', response)) {
      throw new Error(ajv.errorsText())
    }
    return response.endpoints
  }

  async query (endpoints) {
    const response = await this.request(
      this.endpoint,
      constructMessage({
        namespace: 'Rokid.Discovery',
        name: 'ReportState',
        authentication: this.userAuth,
        endpoints
      })
    )
    if (response == null) {
      throw new Error('response is nil')
    }
    if (!ajv.validate('/v2-response-message', response)) {
      throw new Error(ajv.errorsText())
    }
    return response.endpoints
  }
}

module.exports = Protocol
