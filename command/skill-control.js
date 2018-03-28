const Session = require('../lib/session')
const Device = require('../lib/device')

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

  const [ endpoint ] = await session.request('control', directive, [ targetDevice ], { value })

  Device.updateStateById(targetDevice.deviceId, currentSessionName, targetDevice.state, endpoint.state)
  console.log(JSON.stringify(endpoint))
}
