const colors = require('colors')
const Session = require('../lib/session')
const Device = require('../lib/device')
const log = require('../lib/log')

module.exports = async function (id, command) {
  const currentSessionName = Session.getCurrentSessionName()
  const session = new Session(currentSessionName)

  if (!currentSessionName) {
    console.log('please add first')
    return
  }

  const devicesOfSession = Device.getBySessionName(currentSessionName)
  const targetDevice = devicesOfSession[id]

  if (devicesOfSession.length === 0) {
    console.log('please list first')
    return
  }

  if (id > devicesOfSession.length) {
    console.log('no such id, please try again')
    return
  }

  if (command.local) {
    log.listDevice(targetDevice)
  } else {
    const [ data ] = await session.request('query', [ targetDevice ])
    if (command.data) {
      console.log(colors.yellow('response data:'))
      console.log(`${JSON.stringify(data)}\n`)
    }

    Device.updateById(targetDevice.deviceId, currentSessionName, data)
    log.listDevice(data)
  }
}
