
const { v4: uuid } = require('uuid')

const { validate } = require('../schema')
const { ProtocolError } = require('../custom-errors')

function constructMessage ({ namespace, name, userAuth, endpoints = [], payload = {} }) {
  const message = {
    header: {
      messageId: uuid(),
      namespace,
      name,
      payloadVersion: '1'
    },
    endpoints,
    payload
  }
  if (userAuth != null) {
    message.header.authentication = {
      type: 'Bearer',
      token: userAuth.userToken
    }
  }
  return message
}

function handleResponse (response) {
  if (response.header.name === 'Response') {
    return response.endpoints
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
      this.endpoint,
      constructMessage({
        namespace: 'Rokid.Discovery',
        name: 'Discover',
        userAuth: this.userAuth
      })
    )
    if (response == null) {
      throw new Error('response is nil')
    }
    validate([ '/v2-discover-response' ], response)
    return handleResponse(response)
  }

  async control (command, endpoints, payload) {
    const response = await this.request(
      this.endpoint,
      constructMessage({
        namespace: 'Rokid.Control',
        name: command,
        userAuth: this.userAuth,
        endpoints,
        payload
      })
    )
    if (response == null) {
      throw new Error('response is nil')
    }
    validate([ '/v2-response-message' ], response)
    return handleResponse(response)
  }

  async query (endpoints) {
    const response = await this.request(
      this.endpoint,
      constructMessage({
        namespace: 'Rokid.Discovery',
        name: 'ReportState',
        userAuth: this.userAuth,
        endpoints
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
