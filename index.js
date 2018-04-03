const program = require('commander')

require('./lib/update-manager').checkUpdates()
const pkg = require('./package.json')

program
  .command('serve <path> [port]')
  .description('transform local driver to server with default port 3000')
  .action(require('./command/serve'))

program
  .command('ssdp')
  .description('start homebase ssdp broadcast')
  .action(require('./command/ssdp'))

program
  .command('add')
  .description('add a session of remote driver')
  .action(require('./command/add'))

program
  .command('del <name>')
  .description('delete the session of remote driver')
  .action(require('./command/del'))

program
  .command('sessions')
  .description('list all added sessions')
  .action(require('./command/sessions'))

program
  .command('use <name>')
  .description('user an added session')
  .action(require('./command/use'))

program
  .command('list')
  .option('-d, --data', 'show response data of list')
  .option('-l, --local', 'list local devices')
  .description('list all devices of a driver')
  .action(require('./command/list'))

program
  .command('get <id>')
  .option('-l, --local', 'get local devices')
  .option('-d, --data', 'show response data of get')
  .description('get current state of a driver')
  .action(require('./command/get'))

program
  .command('exec <id> <prop> <name> [val]')
  .option('-d, --data', 'show response data of execute')
  .description('execute the device<id> with target action(e.g color num 256)')
  .action(require('./command/execute'))

// todo
// program
//   .command('command <name>')
//   .description('')
//   .action(require('./command/command'));

program
  .version(pkg.version)
  .option('-v, --verbose', 'show raw response body')
  .parse(process.argv)

if (!program.args.length) program.help()
