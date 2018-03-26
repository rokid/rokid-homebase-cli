const _ = require('lodash')

module.exports = function updateState (newState, state) {
  return _.transform(newState, function (obj, value, key) {
    if (value === null && _.has(state, key)) {
      obj[key] = _.get(state, key)
    } else {
      obj[key] = value
    }
  }, {})
}
