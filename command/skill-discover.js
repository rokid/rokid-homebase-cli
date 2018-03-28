const colors = require('colors')
const Session = require('../lib/session')
const Device = require('../lib/device')
const log = require('../lib/log')

module.exports = async function skillDiscover (command) {
  const currentSessionName = Session.getCurrentSessionName()
  const session = new Session()

  if (!currentSessionName) {
    console.log('please add first')
    return
  }

  const devicesOfSession = Device.getBySessionName(currentSessionName)

  if (command.local) {
    if (devicesOfSession.length === 0) {
      console.log('please list first')
      return
    }
    log.listDevices(devicesOfSession)
  } else {
    const endpoints = await session.request('discover')
    if (command.data) {
      console.log(colors.yellow('response data:'))
      console.log(`${JSON.stringify(endpoints)}\n`)
    }

    Device.updateOfSession(devicesOfSession, endpoints, currentSessionName)
    log.listDevices(endpoints)
  }
}
