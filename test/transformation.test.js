const assert = require('assert')
const {
  updateState,
  endpoint2Device,
  device2Endpoint
} = require('../lib/transformation')

describe('transformation.test.js', () => {
  describe('endpoint-device ex-transformation', () => {
    [
      {
        message: 'should transform',
        endpoint: {
          'displayType': 'light',
          'endpointId': '0',
          'displayName': '一号灯',
          'recommendRoomName': '客厅',
          'additionalInfo': {
            'foo': 'bar',
            'from': 'sample-driver',
            'type': 'light'
          },
          'capabilities': [
            {
              'interface': 'Switch',
              'supportedOperations': [
                'on',
                'off'
              ]
            },
            {
              'interface': 'Color',
              'supportedOperations': [
                'random',
                'num'
              ]
            },
            {
              'interface': 'Brightness',
              'supportedOperations': [
                'up',
                'down',
                'max',
                'min',
                'num'
              ]
            }
          ],
          'state': [
            {
              'interface': 'Switch',
              'value': 'off'
            },
            {
              'interface': 'Color',
              'value': 255
            },
            {
              'interface': 'Brightness',
              'value': 0
            }
          ]
        },
        device: {
          'type': 'light',
          'deviceId': '0',
          'name': '一号灯',
          'roomName': '客厅',
          'deviceInfo': {
            'foo': 'bar',
            'from': 'sample-driver',
            'type': 'light'
          },
          'actions': {
            'switch': ['on', 'off'],
            'color': ['random', 'num'],
            'brightness': ['up',
              'down',
              'max',
              'min',
              'num']
          },
          'state': {
            'switch': 'off',
            'color': 255,
            'brightness': 0
          }
        }
      },
      {
        message: '',
        endpoint: {},
        device: {}
      }
    ].forEach(esac => {
      it(`endpoint2Device transformation ${esac.message}`, () => {
        let result = endpoint2Device(esac.endpoint)
        assert.deepEqual(result, esac.device)
        result = device2Endpoint(esac.device)
        assert.deepEqual(result, esac.endpoint)
      })
    })
  })

  describe('update state', () => {
    [
      {
        message: 'new state shall override current state',
        newState: [
          {
            interface: 'Switch',
            value: 'On'
          }
        ],
        state: [
          {
            interface: 'Switch',
            value: 'Off'
          }
        ],
        expected: [
          {
            interface: 'Switch',
            value: 'On'
          }
        ]
      },
      {
        message: 'state that not in new state shall preserve',
        newState: [
          {
            interface: 'Switch',
            value: 'On'
          }
        ],
        state: [
          {
            interface: 'Switch',
            value: 'Off'
          },
          {
            interface: 'Color',
            value: 255
          }
        ],
        expected: [
          {
            interface: 'Switch',
            value: 'On'
          },
          {
            interface: 'Color',
            value: 255
          }
        ]
      }
    ].forEach(esac => {
      it(`updateState: ${esac.message}`, () => {
        let result = updateState(esac.newState, esac.state)
        assert.deepEqual(result, esac.expected)
      })
    })
  })
})
