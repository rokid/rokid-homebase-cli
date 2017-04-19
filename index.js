const program = require('commander');
const pkg = require('./package.json');
const debug = require('debug');
const low = require('lowdb');
const config = require('./lib/config');
const serialize = value => JSON.stringify(value, null, 2);
const db = low(config.dbPath, {format: {serialize}});

db.defaults({
  sessions: [],
  devices: []
})
  .write();

program
  .command('serve <path> [port]')
  .description('transform local driver to server with default port 3000')
  .action(wrap('serve'));

program
  .command('ssdp')
  .description('start homebase ssdp broadcast')
  .action(wrap('ssdp'));

program
  .command('add')
  .description('add a session of remote driver')
  .action(wrap('add'));

program
  .command('del <name>')
  .description('delete the session of remote driver')
  .action(wrap('del'));

program
  .command('sessions')
  .description('list all added sessions')
  .action(wrap('sessions'));

program
  .command('use <name>')
  .description('user an added session')
  .action(wrap('use'));

program
  .command('list')
  .option('-d, --data', 'show response data of list')
  .option('-l, --local', 'list local devices')
  .description('list all devices of a driver')
  .action(wrap('list'));

program
  .command('get <id>')
  .option('-l, --local', 'get local devices')
  .option('-d, --data', 'show response data of get')
  .description('get current state of a driver')
  .action(wrap('get'));

program
  .command('exec <id> <prop> <name> [val]')
  .option('-d, --data', 'show response data of execute')
  .description('execute the device<id> with target action(e.g color num 256)')
  .action(wrap('execute'));

//todo
// program
//   .command('command <name>')
//   .description('')
//   .action(wrap('command'));

program
  .version(pkg.version)
  .option('-v, --verbose', 'show raw response body')
  .parse(process.argv);

if (!program.args.length) program.help();

function wrap(fn) {
  return function(){
    if (program.verbose) {
      // process.env.DEBUG = `${process.env.DEBUG || ''}rhome`;
      debug.enable('rhome');
    }
    require('./command/' + fn).apply(this, arguments)
  };
}
