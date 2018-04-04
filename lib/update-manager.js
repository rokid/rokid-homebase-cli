const urllib = require('urllib')
const semver = require('semver')

const db = require('./db')

module.exports = { checkUpdates }

async function getLatestVersion () {
  const response = await urllib.request('https://api.github.com/repos/Rokid/rokid-homebase-cli/releases/latest', {
    dataType: 'json'
  })
  return response.data.tag_name
}

async function checkUpdates () {
  const pkg = require('../package.json')
  const currentVersion = pkg.version
  let latestVersion = db.get('latestVersion').value()
  if (latestVersion && semver.gt(latestVersion, currentVersion)) {
    process.once('exit', () => {
      console.log(`✨ 发现新版本 ${latestVersion}!（当前 v${currentVersion}）\n请前往 https://github.com/Rokid/rokid-homebase-cli/releases 获取`)
    })
  }
  latestVersion = await getLatestVersion()
  if (semver.gt(latestVersion, currentVersion)) {
    db.set('latestVersion', latestVersion).write()
  }
}
