const colors = require('colors')
const util = require('util')

exports.jsonErrors = function (errors) {
  errors.forEach(error => {
    console.log(colors.red(error.stack))
    console.log(`detail:${JSON.stringify(error.instance)}\n`)
  })
}

exports.resError = function (error) {
  console.error(`status: ${error.status}`.red)
  console.error(`errorName: ${error.errorName}`.red)
  console.error(`message: ${error.message}`.red)
}

exports.listDevices = function (devices) {
  devices.forEach((device, index) => {
    console.log(`id: ${index}`.yellow)
    exports.listDevice(device)
  })
}

exports.listDevice = function (device) {
  console.log(`sessionName: ${device.sessionName}`.yellow)
  console.log(`endpointId: ${device.endpointId}`)
  console.log(`displayName: ${device.displayName}`)
  console.log(`displayType: ${device.displayType}`)
  console.log(`offline: ${device.offline}`)
  console.log()
}

function formatError (err) {
  if (err.name === 'Error' && typeof err.code === 'string') {
    err.name = err.code + err.name
  }
  const errProperties = Object.keys(err).map(key => inspect(key, err[key])).join('\n')
  return util.format('%s: %s\n%s\n',
    err.name,
    err.message,
    errProperties
  )
}

function inspect (key, value) {
  if (value && typeof value === 'object') {
    // force in one line
    value = util.inspect(value)
      .replace(/^\s+/mg, '')
      .replace(/\n/g, ' ')
  } else if (typeof value !== 'string') {
    value = util.inspect(value)
  }
  return key + ': ' + value
}

process.on('unhandledRejection', err => {
  console.error(formatError(err))
})
