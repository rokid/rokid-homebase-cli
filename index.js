const program = require('commander')
const path = require('path')
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config')

require('./lib/update-manager').checkUpdates()
const pkg = require('./package.json')

program
  .command('add')
  .description('add a session of remote driver')
  .action(require('./command/session-add'))

program
  .command('del <name>')
  .description('delete the session of remote driver')
  .action(require('./command/session-del'))

program
  .command('sessions')
  .description('list all added sessions')
  .action(require('./command/session-list'))

program
  .command('use <name>')
  .description('user an added session')
  .action(require('./command/session-use'))

program
  .command('discover')
  .option('-d, --data', 'show response data of list')
  .option('-l, --local', 'list local devices')
  .description('list all devices of a driver')
  .action(require('./command/skill-discover'))

program
  .command('control <id> <directive> [value]')
  .option('-d, --data', 'show response data of execute')
  .description(`execute the device<id> with target action(e.g Media.TVChannel.Set '{ "tvChannel": { "code": "12" } }")`)
  .action(require('./command/skill-control'))

program
  .command('report-state <id>')
  .option('-l, --local', 'get local devices')
  .option('-d, --data', 'show response data of get')
  .description('get current state of a driver')
  .action(require('./command/skill-report-state'))

program
  .version(pkg.version)
  .option('-v, --verbose', 'show raw response body')
  .parse(process.argv)

if (!program.args.length) program.help()
