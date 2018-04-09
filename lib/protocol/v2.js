
const { v4: uuid } = require('uuid')
const _ = require('lodash')

const { validate } = require('../schema')
const { ProtocolError } = require('../custom-errors')

function constructMessage ({ namespace, name, userAuth, endpoint, payload = {} }) {
  const message = {
    header: {
      messageId: uuid(),
      namespace,
      name,
      payloadVersion: '1'
    },
    endpoint: endpoint != null ? _.pick(endpoint, 'endpointId', 'additionalInfo', 'states') : undefined,
    payload
  }
  if (userAuth != null) {
    message.header.authentication = {
      type: 'BearerToken',
      token: userAuth.userToken
    }
  }
  return message
}

function handleResponse (response) {
  if (response.header.name === 'Response') {
    return response.endpoint
  } else if (response.header.name === 'DiscoveryResponse') {
    return _.get(response, 'payload.endpoints', [])
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
    const response = await this.request(
      this.endpoint.toString(),
      constructMessage({
        namespace: 'Rokid.Discovery',
        name: 'Discover',
        userAuth: this.userAuth
      })
    )
    if (response == null) {
      throw new Error('response is nil')
    }
    validate([ '/v2-discovery-response' ], response)
    return handleResponse(response)
  }

  async control (command, endpoint, { value = '{}' }) {
    const payload = JSON.parse(value)

    const response = await this.request(
      this.endpoint.toString(),
      constructMessage({
        namespace: 'Rokid.Control',
        name: command,
        userAuth: this.userAuth,
        endpoint,
        payload
      })
    )
    if (response == null) {
      throw new Error('response is nil')
    }
    validate([ '/v2-response-message' ], response)
    return handleResponse(response)
  }

  async query (endpoint) {
    const response = await this.request(
      this.endpoint.toString(),
      constructMessage({
        namespace: 'Rokid.Query',
        name: 'ReportState',
        userAuth: this.userAuth,
        endpoint
      })
    )
    if (response == null) {
      throw new Error('response is nil')
    }
    validate([ '/v2-response-message' ], response)
    return handleResponse(response)
  }
}

Protocol.constructMessage = constructMessage
module.exports = Protocol
