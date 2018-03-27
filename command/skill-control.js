const _ = require('lodash')
const colors = require('colors')
const Session = require('../lib/session')
const Device = require('../lib/device')
const v = require('../lib/jsonschema')
const apiExecute = require('../jsonschema/api-execute.json')
const execAction = require('../jsonschema/action.json')
const log = require('../lib/log')

module.exports = async function skillControl (id, directive, value, command) {
  const currentSessionName = Session.getCurrentSessionName()
  const session = new Session(currentSessionName)

  if (!currentSessionName) {
    console.log('please add first')
    return
  }

  const devicesOfSession = Device.getBySessionName(currentSessionName)

  if (devicesOfSession.length === 0) {
    console.log('please list first')
    return
  }

  if (id > devicesOfSession.length) {
    console.log('no such id, please try again')
    return
  }

  const targetDevice = devicesOfSession[id]
  targetDevice.sessionName = undefined

  const [ data ] = await session.request('control', directive, [ targetDevice ], { value })
  if (command.data) {
    console.log(colors.yellow('response data:'))
    console.log(`${JSON.stringify(data)}\n`)
  }
  const errors = v.validate(data, apiExecute).errors
  if (errors.length === 0) {
    targetDevice.sessionName = currentSessionName
    Device.updateStateById(targetDevice.deviceId, currentSessionName, targetDevice.state, data)
    console.log(JSON.stringify(data))
  } else {
    console.log(colors.yellow('body checked by json schema:'))
    log.jsonErrors(errors)
  }
}
