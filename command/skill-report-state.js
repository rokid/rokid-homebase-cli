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

  if (devicesOfSession.length === 0) {
    console.log('please list first')
    return
  }

  const targetDevice = devicesOfSession.find(it => it.endpointId === id)

  if (targetDevice == null) {
    console.log('找不到该 endpointId', id)
    return
  }

  if (command.local) {
    log.listDevice(targetDevice)
  } else {
    const data = await session.request('query', targetDevice)
    if (command.data) {
      console.log(colors.yellow('response data:'))
      console.log(`${JSON.stringify(data)}\n`)
    }

    Device.updateById(targetDevice.endpointId, currentSessionName, data)
    log.listDevice(Device.getBySessionName(currentSessionName).find(it => it.endpointId === targetDevice.endpointId))
  }
}
