
const { v4: uuid } = require('uuid')
const _ = require('lodash')
const jwt = require('jsonwebtoken');

const { validate } = require('../schema')
const { ProtocolError } = require('../custom-errors')

function constructMessage ({ namespace, name, userAuth, authType, config, endpoint, payload = {} }) {
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
    if (authType === 'rfc7519') {
      userAuth.userToken = jwt.sign({
        userId: userAuth.userId,
        appId: config.appId
      }, config.appSecret)
    }
    message.header.authorization = {
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
   * @param {string} authType
   * @param {object} config
   */
  constructor (request, endpoint, userAuth, authType, config) {
    this.request = request
    this.endpoint = endpoint
    this.userAuth = userAuth
    this.authType = authType
    this.config = config
  }

  async discover () {
    const response = await this.request(
      this.endpoint.toString(),
      constructMessage({
        namespace: 'Rokid.Discovery',
        name: 'Discover',
        userAuth: this.userAuth,
        authType: this.authType,
        config: this.config
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
        authType: this.authType,
        config: this.config,
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
        authType: this.authType,
        config: this.config,
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
