module.exports = loadConfig()

function loadConfig () {
  const defaultConfig = require('../config/default')
  let local = {}
  try {
    local = require('../config/local')
  } catch (err) {}
  return Object.assign(defaultConfig, local)
}
