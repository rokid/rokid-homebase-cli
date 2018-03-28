
const assert = require('assert')
const _ = require('lodash')

const Protocol = require('../../lib/protocol/v2')
const { constructMessage } = Protocol

describe('protocol/v2', () => {
  let requestMock = async (url, data) => { throw new Error('not implemented') }
  /** @type Protocol */
  let protocol = new Protocol(
    (...args) => requestMock(...args),
    'http://example.com',
    { userId: 'foo', userToken: 'bar' }
  )

  describe('discover', () => {
    it('request shall fit in schema', async () => {
      requestMock = async (url, data) => {
        assert(data != null)
        assert(data.header != null)
        assert(data.header.authentication != null)
        assert(data.header.authentication.type === 'Bearer')
        assert(data.header.authentication.token === 'bar')
        return constructMessage({ namespace: 'Rokid', name: 'Response', endpoints: [] })
      }
      const endpoints = await protocol.discover()
      assert(Array.isArray(endpoints))
      assert(endpoints.length === 0)
    })

    it('shall throw validation error if device is not complete', async () => {
      const device = {
        endpointId: '123',
        displayName: 'foobar',
        displayType: 'light',
        capabilities: [],
        state: []
      }
      await Promise.all(Object.keys(device).map(async key => {
        const dvc = _.omit(device, key)
        mockResponse({ endpoints: [ dvc ] })
        try {
          await protocol.discover()
          assert.fail('should not succeed')
        } catch (err) {

        }
      }))
    })

    it('should reject if response status is not 0', async () => {
      mockResponse({ name: 'ErrorResponse', payload: { code: '101', message: '' } })
      try {
        await protocol.discover()
        assert.fail('should not succeed')
      } catch (err) {
        assert(err.rawResponse != null)
        assert(err.rawResponse.payload.code === '101')
      }
    })
  })

  describe('control', () => {
    it('request shall fit in schema', async () => {
      requestMock = async (url, data) => {
        assert(data != null)
        assert(Array.isArray(data.endpoints))
        assert(data.endpoints[0].state != null)
        assert(data.endpoints[0].additionalInfo != null)
        assert(data.header != null)
        assert(data.header.authentication != null)
        assert(data.header.authentication.type === 'Bearer')
        assert(data.header.authentication.token === 'bar')
        return constructMessage({ namespace: 'Rokid', name: 'Response', endpoints: data.endpoints })
      }
      const endpoints = await protocol.control('Switch.On', [
        { endpointId: '123', additionalInfo: {}, state: [] }
      ], {})
      assert(Array.isArray(endpoints))
      assert(endpoints.length === 1)
    })
  })

  describe('report-state', () => {
    it('request shall fit in schema', async () => {
      requestMock = async (url, data) => {
        assert(data != null)
        assert(Array.isArray(data.endpoints))
        assert(data.endpoints[0].state != null)
        assert(data.endpoints[0].additionalInfo != null)
        assert(data.header != null)
        assert(data.header.authentication != null)
        assert(data.header.authentication.type === 'Bearer')
        assert(data.header.authentication.token === 'bar')
        return constructMessage({ namespace: 'Rokid', name: 'Response', endpoints: data.endpoints })
      }
      const endpoints = await protocol.query([
        { endpointId: '123', additionalInfo: {}, state: [] }
      ])
      assert(Array.isArray(endpoints))
      assert(endpoints.length === 1)
    })
  })

  function mockResponse ({ name = 'Response', endpoints = [], payload = {} }) {
    requestMock = async () => {
      return constructMessage({
        namespace: 'Rokid',
        name,
        endpoints,
        payload
      })
    }
  }
})
