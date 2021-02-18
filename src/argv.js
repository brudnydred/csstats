module.exports = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .demandCommand(1)

  // TYPES
  .boolean('j')
  .boolean('c')
  .array('s')

  // ALIASES
  .alias('j', 'json')
  .alias('c', 'config')
  .alias('s', 'steamids')

  // COMMANDS
  .command('demofile', 'Read demofile')
  .command('total', 'Sum up your stats')
  .command('player', `Get all stats about specific player<s>`)

  // DESCRIBES
  .describe('j', 'Save output to json file')
  .describe('c', `Use config file [config.json]`)
  .describe('s', `Set users' SteamIDs`)

  .help('h')
  .alias('h', 'help')
  .version('v')
  .alias('v', 'version')

  .argv