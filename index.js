// Make the project path easier accessible for use in the require() function
process.env.NODE_PATH = __dirname
require('module')._initPaths() // Might break in the future

// Start test-script, process exits after it
// require('test/test-script')

// Make the logger accessible as a global variable
const logger = require('helpers/logger')

global.log = logger

log.info('VPLAN-VISO_INIT')


// Running the handlers
const VplanReceiver = require('handler/VplanReceiver')

VplanReceiver.run()
