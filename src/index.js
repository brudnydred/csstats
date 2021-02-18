const argv = require('./argv')

const demofile = require('./commands/demofile')
const total = require('./commands/total')

switch(argv._[0]) {
  case 'demofile':
    demofile()
    break
  case 'total':
    total()
    break
  default:
    console.error('Unrecognized command.')
    break
  }
