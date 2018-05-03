/* eslint-disable global-require */
(async function main() {
  // Make the project path easier accessible for use in the require() function
  process.env.NODE_PATH = __dirname
  require('module')._initPaths() // Might break in the future

  const logger = require('helpers/logger')
  const readConfig = require('helpers/read-config')

  global.log = logger // Make the logger globally accessible
  global.Config = await readConfig('config.json') // Make parsed config.json globally accessible

  // Catches unhandled promise errors and logs them
  process.on('unhandledRejection', (error) => {
    Object.assign(error, {
      ErrorString: error.toString(),
      ErrorStack: error.stack,
    })

    log.err('UNHANDLED_REJECTION', error)
  })

  const moment = require('moment')
  moment.locale('de')

  // Start test-script, process exits after it
  // require('test/test-script')

  // Node run location check, run node in project path
  const path = require('path')

  if (path.relative(process.cwd(), __dirname) !== '') {
    log.err('WRONG_NODE_RUN_LOCATION', `Please run 'node index.js' within: ${__dirname}`)
    process.exit(1)
  }

  const pkg = require('./package.json')

  log.info(`VPLAN-VISO_INIT v${pkg.version}`)

  // Running TaskScheduler
  const TaskScheduler = require('handlers/TaskScheduler')
  TaskScheduler.start()

  // Running the handlers
  const VplanReceiver = require('handlers/VplanReceiver')
  const WebServer = require('handlers/WebServer')

  VplanReceiver.run()
  WebServer.run()
}())
