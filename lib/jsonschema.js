const device = require('../jsonschema/device.json')
const actions = require('../jsonschema/actions.json')
const state = require('../jsonschema/state.json')
const Validator = require('jsonschema').Validator
const v = new Validator()

v.addSchema(device, '/device')
v.addSchema(actions, '/actions')
v.addSchema(state, '/state')

module.exports = v
