
const assert = require('assert')
const _ = require('lodash')

const Protocol = require('../../lib/protocol/v1')

describe('protocol/v1', () => {
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
        assert(data.userAuth != null)
        assert(data.userAuth.userId === 'foo')
        assert(data.userAuth.userToken === 'bar')
        return { status: 0, data: [] }
      }
      const endpoints = await protocol.discover()
      assert(Array.isArray(endpoints))
      assert(endpoints.length === 0)
    })

    it('shall throw validation error if device is not complete', async () => {
      const device = {
        deviceId: '123',
        name: 'foobar',
        type: 'light',
        actions: {},
        state: {}
      }
      await Promise.all(Object.keys(device).map(async key => {
        const dvc = _.omit(device, key)
        mockResponse({ status: 0, data: [ dvc ] })
        try {
          await protocol.discover()
          assert.fail('should not succeed')
        } catch (err) {

        }
      }))
    })

    it('should reject if response status is not 0', async () => {
      mockResponse({ status: 101, errorName: '', message: '' })
      try {
        await protocol.discover()
        assert.fail('should not succeed')
      } catch (err) {
        assert(err.rawResponse != null)
        assert(err.rawResponse.status === 101)
      }
    })
  })

  describe('control', () => {
    it('request shall fit in schema', async () => {
      requestMock = async (url, data) => {
        assert(data != null)
        assert(data.device != null)
        assert(data.device.state != null)
        assert(data.device.deviceInfo != null)
        assert(data.device.userAuth != null)
        assert(data.device.userAuth.userId === 'foo')
        assert(data.device.userAuth.userToken === 'bar')
        return { status: 0, data: data.device.state }
      }
      const endpoints = await protocol.control('Switch.On', [ { deviceId: '123', deviceInfo: {}, state: {} } ], {})
      assert(Array.isArray(endpoints))
      assert(endpoints.length === 1)
    })
  })

  describe('report-state', () => {
    it('request shall fit in schema', async () => {
      requestMock = async (url, data) => {
        assert(data != null)
        assert(data.device != null)
        assert(data.device.state != null)
        assert(data.device.deviceInfo != null)
        assert(data.userAuth != null)
        assert(data.userAuth.userId === 'foo')
        assert(data.userAuth.userToken === 'bar')
        return { status: 0, data: Object.assign({ name: 'foobar', type: 'light', actions: {} }, data.device) }
      }
      const endpoints = await protocol.query([ { deviceId: '123', deviceInfo: {}, state: {} } ])
      assert(Array.isArray(endpoints))
      assert(endpoints.length === 1)
    })
  })

  function mockResponse (data) {
    requestMock = async () => data
  }
})
