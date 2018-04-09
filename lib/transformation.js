const _ = require('lodash')

function updateState (newState, state) {
  return _.unionBy(newState, state, state => state.interface)
}

function endpoint2Device (endpoint) {
  const keyMapper = {
    endpointId: 'deviceId',
    displayType: 'type',
    displayName: 'name',
    recommendRoomName: 'roomName',
    capabilities: 'actions',
    additionalInfo: 'deviceInfo',
    states: 'state'
  }
  const valueMapper = {
    actions: capabilities => {
      const actions = {}
      _.forEach(capabilities, cap => {
        actions[cap.interface] = cap.supportedOperations
      })
      return actions
    },
    state: state => {
      const obj = {}
      _.forEach(state, s => {
        obj[s.interface] = s.value
      })
      return obj
    }
  }
  endpoint = _.mapKeys(endpoint, (value, key) => {
    return keyMapper[key] || key
  })
  endpoint = _.mapValues(endpoint, (value, key) => {
    const mapper = valueMapper[key]
    if (mapper) {
      return mapper(value)
    }
    return value
  })
  return endpoint
}

function device2Endpoint (device) {
  const keyMapper = {
    deviceId: 'endpointId',
    type: 'displayType',
    name: 'displayName',
    roomName: 'recommendRoomName',
    deviceInfo: 'additionalInfo',
    actions: 'capabilities',
    state: 'states'
  }
  const valueMapper = {
    capabilities: actions => {
      return Object.keys(actions).map(key => {
        return {
          interface: key,
          supportedOperations: actions[key]
        }
      })
    },
    states: state => {
      return Object.keys(state).map(key => {
        return {
          interface: key,
          value: state[key]
        }
      })
    }
  }
  device = _.mapKeys(device, (value, key) => {
    return keyMapper[key] || key
  })
  device = _.mapValues(device, (value, key) => {
    const mapper = valueMapper[key]
    if (mapper) {
      return mapper(value)
    }
    return value
  })
  return device
}

module.exports = { updateState, endpoint2Device, device2Endpoint }
