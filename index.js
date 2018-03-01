// Make the project path easier accessible for use in the require() function
process.env.NODE_PATH = __dirname
require('module')._initPaths() // Might break in the future

// Make the logger accessible as a global variable
const logger = require('helpers/logger')

global.log = logger
global.__basedir = __dirname // Set the project dir as global __basedir

// Start test-script, process exits after it
// require('test/test-script')

const pathTools = require('path')

if (pathTools.relative(process.cwd(), __basedir) !== '') {
  log.err('WRONG_NODE_RUN_LOCATION', `Please run 'node index.js' within: ${__basedir}`)
  process.exit()
}

log.info('VPLAN-VISO_INIT')


// Running the handlers
const VplanReceiver = require('handler/VplanReceiver')

VplanReceiver.run()
